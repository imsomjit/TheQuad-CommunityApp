import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { MessageSquare, X, Hash, Users, Plus, Send, ChevronLeft, Loader2, Sparkles, Key, Copy, Check, CheckCheck, Pin, PinOff, Bot, MoreVertical, Eraser, Trash2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useApp } from "../../context/AppContext";
import { useNavigate } from "react-router-dom";
import { socket } from "../../services/socket";
import api, { getAccessToken, setAccessToken, authApi } from "../../services/api";
import { format, isSameDay, isToday, isYesterday } from "date-fns";
import { toast } from "sonner";
import { chatApi, usersApi } from "../../services/api";
import CreateRoomModal from "./CreateRoomModal";
import JoinRoomModal from "./JoinRoomModal";
import AIGuideChat from "./AIGuideChat";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "../ui/dropdown-menu";
import { getAvatarFallback } from "../../utils/fallbacks";

export default function ChatSidebar({ isOpen, onToggle, scrolled }) {
  const { user, isAuthenticated } = useAuth();
  const { setNotifications } = useApp();
  const navigate = useNavigate();
  
  const [rooms, setRooms] = useState([]);
  const [activeRoom, setActiveRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [activeTab, setActiveTab] = useState("lounges");
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [typingUsers, setTypingUsers] = useState({});
  const [followingUsers, setFollowingUsers] = useState([]);
  const [startingChatId, setStartingChatId] = useState(null);
  
  const typingTimeoutRef = useRef({});
  const messagesEndRef = useRef(null);
  const hasAutoJoined = useRef(false);
  const sidebarRef = useRef(null);

  // Helper: ensure we have a valid token before connecting socket
  const connectSocket = useCallback(async () => {
    if (socket.connected) return;
    
    let token = getAccessToken();
    if (!token) {
      // Token not in memory — refresh it first
      try {
        const { data } = await authApi.refresh();
        token = data.data.accessToken;
        setAccessToken(token);
      } catch (e) {
        console.error("Could not refresh token for socket:", e.message);
        return;
      }
    }
    
    socket.auth = { token };
    socket.connect();
  }, []);

  useEffect(() => {
    if (rooms.length === 0) fetchRooms();
    
    if (isAuthenticated) {
      connectSocket();

      // Fetch initial online users
      chatApi.getOnlineUsers().then(res => {
        if (res.data) setOnlineUsers(new Set(res.data));
      }).catch(console.error);
    }
    
    // Prevent body scroll strictly on mobile when chat is open
    if (isOpen && window.innerWidth < 768) {
      const scrollY = window.scrollY;
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = "100%";
      document.body.setAttribute("data-scroll-y", scrollY);
    } else {
      const scrollY = document.body.getAttribute("data-scroll-y");
      if (scrollY !== null) {
        document.body.style.position = "";
        document.body.style.top = "";
        document.body.style.width = "";
        window.scrollTo(0, parseInt(scrollY || "0"));
        document.body.removeAttribute("data-scroll-y");
      }
    }

    return () => {
      const scrollY = document.body.getAttribute("data-scroll-y");
      if (scrollY !== null) {
        document.body.style.position = "";
        document.body.style.top = "";
        document.body.style.width = "";
        window.scrollTo(0, parseInt(scrollY || "0"));
        document.body.removeAttribute("data-scroll-y");
      }
    };
  }, [isOpen, isAuthenticated, connectSocket]);



  useEffect(() => {
    const onConnect = () => {
      console.log("Socket connected globally!");
      setIsConnected(true);
    };
    const onDisconnect = () => setIsConnected(false);

    // Initial check
    setIsConnected(socket.connected);

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
  }, []);

  const fetchRooms = async () => {
    setLoadingRooms(true);
    // Only show the full init spinner if we don't have rooms yet
    if (rooms.length === 0) setIsInitializing(true);
    
    try {
      const res = await api.get("/chat/rooms");
      const fetchedRooms = res.data.data;
      setRooms(fetchedRooms);

      // Auto-join previously active room
      if (user && user.id && !activeRoom && !hasAutoJoined.current) {
        const savedRoomId = localStorage.getItem(`thequad_chat_room_${user.id}`);
        if (savedRoomId) {
          const roomToJoin = fetchedRooms.find(r => r.id === savedRoomId);
          if (roomToJoin) {
            hasAutoJoined.current = true;
            await joinRoom(roomToJoin);
          } else {
            // Room no longer exists
            localStorage.removeItem(`thequad_chat_room_${user.id}`);
          }
        }
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load chat rooms");
    } finally {
      setLoadingRooms(false);
      setIsInitializing(false);
    }
  };

  useEffect(() => {
    if (activeTab === "messages" && user && user.username) {
      usersApi.getFollowing(user.username)
        .then(users => {
          if (users) setFollowingUsers(users);
        })
        .catch(console.error);
    }
  }, [activeTab, user]);

  // Listen for room updates (creates and deletes)
  useEffect(() => {
    const handleRoomCreated = (room) => {
      setRooms((prev) => {
        // Prevent duplicates
        if (prev.find(r => r.id === room.id)) return prev;
        return [...prev, room];
      });
    };

    const handleRoomDeleted = (roomId) => {
      setRooms((prev) => prev.filter(r => r.id !== roomId));
      // If we are currently in this room, kick us out
      if (activeRoom && activeRoom.id === roomId) {
        setActiveRoom(null);
        toast.info("This room was closed due to inactivity.");
      }
    };

    socket.on("room_created", handleRoomCreated);
    socket.on("room_deleted", handleRoomDeleted);

    return () => {
      socket.off("room_created", handleRoomCreated);
      socket.off("room_deleted", handleRoomDeleted);
    };
  }, [activeRoom]);

  // Join room and fetch history
  const joinRoom = async (room) => {
    if (!isAuthenticated) {
      return navigate("/login");
    }
    setActiveRoom(room);
    if (user && user.id) {
      localStorage.setItem(`thequad_chat_room_${user.id}`, room.id);
    }
    setLoadingMessages(true);
    try {
      // Fetch history
      const res = await api.get(`/chat/rooms/${room.id}/messages`);
      setMessages(res.data.data);
      
      // Join socket room
      socket.emit("join_room", room.id);
      
      // Optimistically clear the unread count in local state
      setRooms(prev => prev.map(r => String(r.id) === String(room.id) ? { ...r, unreadCount: 0 } : r));

      // Emit mark read to backend only if it's a DM (we don't track read receipts for global lounges to save DB space)
      if (room.type === 'direct') {
        socket.emit("mark_read", room.id);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load messages");
      setActiveRoom(null);
    } finally {
      setLoadingMessages(false);
      scrollToBottom();
    }
  };

  // Listen for new messages & reconnects
  useEffect(() => {
    const handleReceiveMessage = (msg) => {
      // If the chat is open AND the user is looking at this exact room
      if (isOpen && activeRoom && String(msg.roomId) === String(activeRoom.id)) {
        setMessages((prev) => [...prev, msg]);
        scrollToBottom();
        // Send mark_read immediately since they are looking at it
        if (activeRoom.type === 'direct') {
          socket.emit("mark_read", activeRoom.id);
        }
      } else if (msg.senderId !== user?.id) {
        // Increment unread count for the room and move to top
        const exists = rooms.find(r => String(r.id) === String(msg.roomId));
        if (!exists) {
          // If the room is not in our local state, it means it's a brand new chat.
          // Fetch the updated list of rooms from the backend to load it with its unread counts.
          fetchRooms();
        } else {
          setRooms(prev => {
            const roomToUpdate = prev.find(r => String(r.id) === String(msg.roomId));
            if (!roomToUpdate) return prev;
            const filtered = prev.filter(r => String(r.id) !== String(msg.roomId));
            return [{ ...roomToUpdate, unreadCount: (roomToUpdate.unreadCount || 0) + 1 }, ...filtered];
          });
        }
        // If chatbar is not open, show notification in AppContext instead of toast
        const room = rooms.find(r => String(r.id) === String(msg.roomId));
        const isGlobal = room ? room.type === 'global' : false;
        
        if (!isOpen && !isGlobal) {
           const sender = msg.sender || (room && room.participants?.find(p => p.id === msg.senderId));
           const newNotif = {
             id: `chat_${msg.id}`,
             type: "chat_message",
             text: "sent you a new message",
             targetType: "chat",
             targetId: msg.roomId,
             targetTitle: "message from " + (sender ? sender.name : 'someone'),
             target: msg.content ? (msg.content.substring(0, 40) + (msg.content.length > 40 ? "..." : "")) : "",
             actor: sender,
             read: false,
             createdAt: new Date().toISOString()
           };
           setNotifications(prev => {
             if (prev.find(n => n.id === newNotif.id)) return prev;
             return [newNotif, ...prev];
           });
        }
      }
    };
    
    const handleReconnect = () => {
      if (activeRoom) {
        socket.emit("join_room", activeRoom.id);
      }
    };
    
    const handleError = (err) => {
      toast.error(err.message || "An error occurred");
    };

    const handleConnectError = async (err) => {
      console.error("Socket connect_error:", err.message);
      if (err.message.includes("Authentication")) {
        // Token is expired or missing — refresh it and reconnect
        try {
          const { data } = await authApi.refresh();
          const newToken = data.data.accessToken;
          setAccessToken(newToken);
          socket.auth = { token: newToken };
          socket.connect();
        } catch (e) {
          console.error("Token refresh failed during socket reconnect:", e.message);
          toast.error("Session expired. Please refresh the page.");
        }
      }
    };

    const handleUserOnline = (userId) => {
      setOnlineUsers(prev => {
        const next = new Set(prev);
        next.add(userId);
        return next;
      });
    };

    const handleUserOffline = (userId) => {
      setOnlineUsers(prev => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    };

    const handleTypingStart = ({ roomId, userId }) => {
      setTypingUsers(prev => ({
        ...prev,
        [roomId]: new Set([...(prev[roomId] || []), userId])
      }));
    };

    const handleTypingEnd = ({ roomId, userId }) => {
      setTypingUsers(prev => {
        const next = { ...prev };
        if (next[roomId]) {
          next[roomId] = new Set([...next[roomId]].filter(id => id !== userId));
        }
        return next;
      });
    };

    const handleMessagesRead = ({ roomId, byUserId }) => {
      if (activeRoom && String(activeRoom.id) === String(roomId)) {
        setMessages(prev => prev.map(m => ({ ...m, readBy: [...(m.readBy || []), byUserId] })));
      }
    };

    socket.on("receive_message", handleReceiveMessage);
    socket.on("connect", handleReconnect);
    socket.on("error", handleError);
    socket.on("connect_error", handleConnectError);
    socket.on("user_online", handleUserOnline);
    socket.on("user_offline", handleUserOffline);
    socket.on("typing_start", handleTypingStart);
    socket.on("typing_end", handleTypingEnd);
    socket.on("messages_read", handleMessagesRead);
    
    return () => {
      socket.off("receive_message", handleReceiveMessage);
      socket.off("connect", handleReconnect);
      socket.off("error", handleError);
      socket.off("connect_error", handleConnectError);
      socket.off("user_online", handleUserOnline);
      socket.off("user_offline", handleUserOffline);
      socket.off("typing_start", handleTypingStart);
      socket.off("typing_end", handleTypingEnd);
      socket.off("messages_read", handleMessagesRead);
    };
  }, [activeRoom, isOpen, rooms, user]);

  // Handle open_chat_room custom event
  useEffect(() => {
    const handleOpenChat = (e) => {
      const { roomId } = e.detail;
      const navigateToRoom = (rs) => {
        const targetRoom = rs.find(r => r.id === roomId);
        if (targetRoom) {
          setActiveTab(targetRoom.type === 'direct' ? 'messages' : 'lounges');
          joinRoom(targetRoom);
        }
      };

      if (rooms.length > 0) {
        navigateToRoom(rooms);
      } else {
        fetchRooms().then(rs => navigateToRoom(rs));
      }
    };
    window.addEventListener("open_chat_room", handleOpenChat);
    return () => window.removeEventListener("open_chat_room", handleOpenChat);
  }, [rooms, joinRoom]);

  // Handle mobile visual viewport changes (e.g. keyboard appearing)
  useEffect(() => {
    const handleResize = () => {
      if (window.visualViewport && window.innerWidth < 768) {
        if (sidebarRef.current) {
          sidebarRef.current.style.height = `${window.visualViewport.height}px`;
          sidebarRef.current.style.top = `${window.visualViewport.offsetTop}px`;
        }
        // We also might need to adjust the body scroll if the browser panned
        if (document.activeElement?.tagName === 'INPUT') {
          // window.scrollTo(0, 0); // No longer needed with body position fixed
        }
      } else {
        if (sidebarRef.current) {
          sidebarRef.current.style.height = '';
          sidebarRef.current.style.top = '';
        }
      }
      scrollToBottom();
    };

    window.visualViewport?.addEventListener('resize', handleResize);
    window.visualViewport?.addEventListener('scroll', handleResize);
    window.addEventListener('resize', handleResize);
    
    // Initial check
    handleResize();

    return () => {
      window.visualViewport?.removeEventListener('resize', handleResize);
      window.visualViewport?.removeEventListener('scroll', handleResize);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (!inputValue.trim() || !activeRoom) return;

    if (!socket.connected) {
      connectSocket();
      toast.info("Reconnecting... Please try again in a moment.");
      return;
    }

    socket.emit("send_message", {
      roomId: activeRoom.id,
      content: inputValue,
    });

    setInputValue("");
    
    // Stop typing
    socket.emit("typing_end", activeRoom.id);
    if (typingTimeoutRef.current[activeRoom.id]) {
      clearTimeout(typingTimeoutRef.current[activeRoom.id]);
    }
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
    
    if (!activeRoom) return;
    
    if (e.target.value.trim() !== "") {
      socket.emit("typing_start", activeRoom.id);
      
      if (typingTimeoutRef.current[activeRoom.id]) {
        clearTimeout(typingTimeoutRef.current[activeRoom.id]);
      }
      
      typingTimeoutRef.current[activeRoom.id] = setTimeout(() => {
        socket.emit("typing_end", activeRoom.id);
      }, 2000);
    } else {
      socket.emit("typing_end", activeRoom.id);
    }
  };

  const handlePin = async (e, roomId) => {
    e.stopPropagation();
    try {
      await api.post(`/chat/rooms/${roomId}/pin`);
      setRooms(prev => prev.map(r => r.id === roomId ? { ...r, isPinned: true } : r));
      toast.success("Room pinned!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to pin room");
    }
  };

  const handleUnpin = async (e, roomId) => {
    e.stopPropagation();
    if (!isAuthenticated) return navigate("/login");
    try {
      await api.delete(`/chat/rooms/${roomId}/pin`);
      setRooms(prev => prev.map(r => r.id === roomId ? { ...r, isPinned: false } : r));
      toast.success("Room unpinned!");
    } catch (err) {
      toast.error("Failed to unpin room");
    }
  };

  const handleClearChat = async () => {
    if (!activeRoom) return;
    try {
      await api.post(`/chat/rooms/${activeRoom.id}/clear`);
      setMessages([]);
      toast.success("Chat history cleared.");
    } catch (err) {
      toast.error("Failed to clear chat");
    }
  };

  const handleDeleteChat = async () => {
    if (!activeRoom) return;
    if (!confirm("Are you sure you want to delete this chat completely? This action cannot be undone.")) return;
    try {
      await api.delete(`/chat/rooms/${activeRoom.id}`);
      setRooms(prev => prev.filter(r => r.id !== activeRoom.id));
      socket.emit("leave_room", activeRoom.id);
      setActiveRoom(null);
      if (user && user.id) {
        localStorage.removeItem(`thequad_chat_room_${user.id}`);
      }
      toast.success("Chat deleted.");
    } catch (err) {
      toast.error("Failed to delete chat");
    }
  };

  const startDirectMessage = async (targetUser) => {
    if (startingChatId === targetUser.id) return;
    setStartingChatId(targetUser.id);
    try {
      const res = await api.post(`/chat/direct/${targetUser.id}`);
      const roomId = res.data.data.id;
      // Try to find if room already existed in state
      let roomToJoin = rooms.find(r => r.id === roomId);
      if (!roomToJoin) {
        // Create a temporary room object so we can join immediately
        roomToJoin = {
          id: roomId,
          type: 'direct',
          isPrivate: true,
          participants: [user, targetUser],
          unreadCount: 0
        };
        setRooms(prev => [...prev, roomToJoin]);
      }
      joinRoom(roomToJoin);
    } catch (err) {
      toast.error("Failed to start chat");
    } finally {
      setStartingChatId(null);
    }
  };

  const lounges = rooms.filter(r => r.type !== 'direct');
  const dms = rooms.filter(r => r.type === 'direct');

  // Create synthetic rooms for followed users who don't have a DM yet
  const dmUserIds = new Set();
  const uniqueDmsMap = new Map();
  
  dms.forEach(r => {
    const otherParticipant = r.participants?.find(p => p.id !== user?.id);
    if (otherParticipant) {
      const idStr = String(otherParticipant.id);
      dmUserIds.add(idStr);
      if (!uniqueDmsMap.has(idStr)) {
        uniqueDmsMap.set(idStr, r);
      }
    }
  });
  const uniqueDms = Array.from(uniqueDmsMap.values());

  const syntheticUserIds = new Set();
  const followingSyntheticRooms = followingUsers
    .filter(u => {
      const idStr = String(u.id);
      if (dmUserIds.has(idStr) || syntheticUserIds.has(idStr)) return false;
      syntheticUserIds.add(idStr);
      return true;
    })
    .map(u => ({
      id: `synthetic_${u.id}`,
      type: 'direct',
      isSynthetic: true,
      targetUser: u,
      isPinned: false,
      unreadCount: 0
    }));

  const visibleRooms = activeTab === "lounges" ? lounges : [...uniqueDms, ...followingSyntheticRooms];
  
  const dmsUnreadCount = dms.reduce((acc, r) => acc + (r.unreadCount || 0), 0);
  const loungesUnreadCount = lounges.reduce((acc, r) => acc + (r.unreadCount || 0), 0);
  const pinnedRooms = visibleRooms.filter(r => r.isPinned);
  const regularRooms = visibleRooms.filter(r => !r.isPinned);

  const renderRoom = (room) => {
    const isDirect = room.type === 'direct';
    const otherParticipant = room.isSynthetic ? room.targetUser : (isDirect ? room.participants?.find(p => p.id !== user.id) : null);

    return (
      <button
        key={room.id}
        onClick={() => {
          if (room.isSynthetic) {
            startDirectMessage(room.targetUser);
          } else {
            joinRoom(room);
          }
        }}
        className="group flex w-full items-center gap-3 rounded-lg border border-transparent p-3 text-left transition-colors hover:border-rule hover:bg-paper-2"
      >
        <div className="relative">
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full overflow-hidden ${room.type === 'ephemeral' ? 'bg-accent/10 text-accent' : 'bg-rule/50 text-ink-2'}`}>
            {isDirect && otherParticipant ? (
                <img src={otherParticipant.avatarUrl || getAvatarFallback(otherParticipant.name, otherParticipant.username)} alt={otherParticipant.name} className="h-full w-full object-cover" />
            ) : room.type === "global" ? <Hash size={18} /> : room.type === "ephemeral" ? <Sparkles size={18} /> : <Users size={18} />}
          </div>
          {isDirect && otherParticipant && onlineUsers.has(otherParticipant.id) && (
            <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-paper bg-green-500"></div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-base text-ink flex items-center gap-2 truncate">
            <span className="truncate">{isDirect && otherParticipant ? otherParticipant.name : room.name}</span>
            {room.type === "ephemeral" && !room.isPrivate && <span className="rounded bg-accent/10 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-accent shrink-0">Live</span>}
            {room.isPrivate && room.type !== "direct" && <span className="rounded bg-yellow-500/10 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-yellow-600 shrink-0 border border-yellow-500/20">Private</span>}
          </p>
          <p className="text-sm text-ink-3 line-clamp-1">{isDirect && otherParticipant ? `@${otherParticipant.username}` : (room.description || "Join the discussion")}</p>
        </div>
        <div className="flex items-center gap-2">
          {room.unreadCount > 0 && (
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-accent"></span>
            </span>
          )}
        </div>
      </button>
    );
  };

  return (
    <>
      <div
        ref={sidebarRef}
        style={{ touchAction: 'none' }} // Prevents browser from panning the whole page when dragging the sidebar
        className={`fixed right-0 z-50 flex w-full md:w-[22rem] transform flex-col border-l border-rule/70 bg-paper/95 backdrop-blur-xl transition-all duration-300 ease-out md:z-30 top-0 md:bg-paper/50 md:backdrop-blur-md md:bottom-0 md:h-auto ${scrolled ? 'md:top-[56px]' : 'md:top-[92px]'} ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Vertical Toggle Handle (Desktop only) */}
        {!isOpen && (
          <button
            onClick={onToggle}
            className="absolute top-48 -left-[42px] hidden md:flex h-32 w-[42px] -translate-y-1/2 flex-col items-center justify-center rounded-l-xl border-y border-l border-rule bg-accent/10 backdrop-blur-xl text-accent shadow-[-4px_0_12px_-4px_rgba(0,0,0,0.2)] hover:w-[48px] hover:-left-[48px] transition-all duration-300 z-50 group cursor-pointer"
            title="Toggle Chats"
          >
            <div className="flex -rotate-90 flex-row items-center gap-2 uppercase tracking-[0.3em] font-mono text-[10px] font-bold whitespace-nowrap">
              <MessageSquare size={14} className="group-hover:text-accent transition-colors opacity-70 group-hover:opacity-100" />
              <span>Chats...</span>
            </div>
          </button>
        )}

        {isInitializing ? (
          <div className="flex h-full w-full flex-col items-center justify-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-accent" />
            <p className="text-xs font-mono tracking-wide text-ink-3 uppercase">Restoring Session...</p>
          </div>
        ) : !activeRoom && activeTab !== 'bot' ? (
          // --- ROOM LIST VIEW ---
          <>
            <div className="flex flex-col border-b border-rule bg-paper-2/50 backdrop-blur-sm">
              <div className="flex items-center justify-between p-4 pb-2 sm:pb-1">
                <h2 className="font-mono text-xs uppercase tracking-wider text-ink font-semibold">Chats...</h2>
                <div className="flex items-center gap-1">
                  <button 
                    onClick={() => {
                      if (!isAuthenticated) return navigate("/login");
                      setIsJoinModalOpen(true);
                    }}
                    className="rounded p-1 text-accent/70 hover:bg-rule"
                    title="Join Private Room"
                  >
                    <Key size={18} />
                  </button>
                  <button 
                    onClick={() => {
                      if (!isAuthenticated) return navigate("/login");
                      setIsModalOpen(true);
                    }}
                    className="rounded p-1 text-green-500/70 hover:bg-rule"
                    title="Create Study Room"
                  >
                    <Plus size={18} />
                  </button>
                  <button 
                    onClick={onToggle}
                    className="rounded p-1 text-red-500/70 hover:bg-rule"
                    title="Close Chat"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>
              {/* Tabs */}
              <div className="flex px-4 pt-1 gap-4">
                <button 
                  onClick={() => setActiveTab("lounges")}
                  className={`relative pb-2 text-sm font-medium font-mono border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'lounges' ? 'border-accent text-accent' : 'border-transparent text-ink-3 hover:text-ink'}`}
                >
                  <Users size={14} /> Lounges
                  {loungesUnreadCount > 0 && (
                    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-accent/20 text-[10px] font-bold text-accent">
                      {loungesUnreadCount > 99 ? '99+' : loungesUnreadCount}
                    </span>
                  )}
                </button>
                {isAuthenticated && (
                  <button 
                    onClick={() => setActiveTab("messages")}
                    className={`relative pb-2 text-sm font-medium font-mono border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'messages' ? 'border-accent text-accent' : 'border-transparent text-ink-3 hover:text-ink'}`}
                  >
                    <MessageSquare size={14} /> Messages
                    {dmsUnreadCount > 0 && (
                      <span className="flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-rule shadow-sm">
                        {dmsUnreadCount > 99 ? '99+' : dmsUnreadCount}
                      </span>
                    )}
                  </button>
                )}
                <button 
                  onClick={() => setActiveTab("bot")}
                  className={`relative pb-2 text-sm font-medium font-mono border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'bot' ? 'border-syntax-cyan text-syntax-cyan' : 'border-transparent text-ink-3 hover:text-ink'}`}
                >
                  <Bot size={14} /> AI Guide
                </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto overscroll-contain p-4" style={{ touchAction: 'pan-y' }}>
              {loadingRooms ? (
                <div className="flex h-32 items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-ink-3" />
                </div>
              ) : visibleRooms.length > 0 ? (
                <div className="space-y-4">
                  {pinnedRooms.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-bold uppercase tracking-wider text-ink-3 px-1">Pinned</p>
                      {pinnedRooms.map(renderRoom)}
                    </div>
                  )}
                  {regularRooms.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-bold uppercase tracking-wider text-ink-3 px-1">All {activeTab === "lounges" ? "Lounges" : "Messages"}</p>
                      {regularRooms.map(renderRoom)}
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-center text-sm text-ink-3 mt-10">No {activeTab} available.</p>
              )}
            </div>
          </>
        ) : activeTab === 'bot' ? (
          <AIGuideChat onClose={() => setActiveTab('lounges')} />
        ) : (
          // --- CHAT WINDOW VIEW ---
          <>
            <div className="flex items-center justify-between border-b border-rule bg-paper-2/50 p-3 backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => {
                    socket.emit("leave_room", activeRoom.id);
                    setActiveRoom(null);
                    if (user && user.id) {
                      localStorage.removeItem(`thequad_chat_room_${user.id}`);
                    }
                  }}
                  className="rounded p-1.5 text-ink-3 hover:bg-rule hover:text-ink transition-colors"
                >
                  <ChevronLeft size={18} />
                </button>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <div 
                      className={`flex h-8 w-8 items-center justify-center rounded-full overflow-hidden ${activeRoom.type === 'ephemeral' ? 'bg-accent/10 text-accent' : 'bg-rule/50 text-ink-2'} ${activeRoom.type === 'direct' ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`}
                      onClick={() => {
                        if (activeRoom.type === "direct") {
                          const otherP = activeRoom.participants?.find(p => p.id !== user?.id);
                          if (otherP) {
                            onToggle();
                            navigate(`/u/${otherP.username}`);
                          }
                        }
                      }}
                      title={activeRoom.type === "direct" ? "View Profile" : ""}
                    >
                      {activeRoom.type === "direct" && activeRoom.participants?.find(p => p.id !== user.id) ? (
                          <img src={activeRoom.participants.find(p => p.id !== user.id).avatarUrl || getAvatarFallback(activeRoom.participants.find(p => p.id !== user.id).name, activeRoom.participants.find(p => p.id !== user.id).username)} alt="Avatar" className="h-full w-full object-cover" />
                      ) : activeRoom.type === "global" ? <Hash size={14} /> : activeRoom.type === "ephemeral" ? <Sparkles size={14} /> : <Users size={14} />}
                    </div>
                    {activeRoom.type === "direct" && activeRoom.participants?.find(p => p.id !== user.id) && onlineUsers.has(activeRoom.participants.find(p => p.id !== user.id).id) && (
                      <div className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-paper bg-green-500 pointer-events-none"></div>
                    )}
                  </div>
                  <div className="flex flex-col">
                    <h2 
                      className={`font-medium text-base text-ink truncate max-w-[140px] leading-tight ${activeRoom.type === 'direct' ? 'cursor-pointer hover:text-accent transition-colors' : ''}`}
                      onClick={() => {
                        if (activeRoom.type === "direct") {
                          const otherP = activeRoom.participants?.find(p => p.id !== user?.id);
                          if (otherP) {
                            onToggle();
                            navigate(`/u/${otherP.username}`);
                          }
                        }
                      }}
                      title={activeRoom.type === "direct" ? "View Profile" : ""}
                    >
                      {activeRoom.type === "direct" && activeRoom.participants ? activeRoom.participants.find(p => p.id !== user.id)?.name || activeRoom.name : activeRoom.name}
                    </h2>
                    {activeRoom.type === "direct" && activeRoom.participants?.find(p => p.id !== user.id) && onlineUsers.has(activeRoom.participants.find(p => p.id !== user.id).id) && (
                      <span className="text-[10px] text-green-500 font-medium leading-none mt-0.5">Online</span>
                    )}
                  </div>
                  {!isConnected && (
                    <span className="flex h-2 w-2 rounded-full bg-yellow-500 animate-pulse" title="Connecting..."></span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button 
                  onClick={onToggle}
                  className="rounded p-1.5 text-ink-3 hover:bg-rule hover:text-ink transition-colors"
                  title="Close Sidebar"
                >
                  <X size={18} />
                </button>
                <DropdownMenu modal={false}>
                  <DropdownMenuTrigger asChild>
                    <button className="rounded p-1.5 text-ink-3 hover:bg-rule hover:text-ink transition-colors" title="Options">
                      <MoreVertical size={18} />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                  {activeRoom.isPinned ? (
                    <DropdownMenuItem onClick={(e) => handleUnpin(e, activeRoom.id)}>
                      <PinOff size={16} className="mr-2" />
                      Unpin Chat
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem onClick={(e) => handlePin(e, activeRoom.id)}>
                      <Pin size={16} className="mr-2" />
                      Pin Chat
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={handleClearChat}>
                    <Eraser size={16} className="mr-2" />
                    Clear Chat
                  </DropdownMenuItem>
                  {(activeRoom.type === 'direct' || (activeRoom.type === 'ephemeral' && activeRoom.creatorId === user?.id)) && (
                    <DropdownMenuItem onClick={handleDeleteChat} className="text-red-500 hover:text-red-600 hover:bg-red-50 focus:text-red-600 focus:bg-red-50">
                      <Trash2 size={16} className="mr-2" />
                      Delete Chat
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
              </div>
            </div>

            {/* Secret Code Header for Private Rooms (not Direct) */}
            {activeRoom.isPrivate && activeRoom.type !== "direct" && (
              <div className="border-b border-rule bg-accent/5 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Key size={16} className="text-accent" />
                  <span className="text-sm font-medium text-ink-2">Secret Code:</span>
                  <span className="font-mono font-bold tracking-widest text-accent">{activeRoom.joinCode}</span>
                </div>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(activeRoom.joinCode);
                    setCopied(true);
                    toast.success("Code copied!");
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="flex items-center gap-1 rounded bg-white px-2 py-1 text-xs font-medium text-ink-2 shadow-sm border border-rule hover:bg-paper"
                >
                  {copied ? <Check size={14} className="text-accent" /> : <Copy size={14} />}
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
            )}
            
            <div className="flex-1 overflow-y-auto overscroll-contain p-4 flex flex-col [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]" style={{ touchAction: 'pan-y' }}>
              {loadingMessages ? (
                <div className="flex flex-1 items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-ink-3" />
                </div>
              ) : messages.length > 0 ? (
                messages.map((msg, i) => {
                  const isMe = msg.senderId === user.id;
                  const isLastMessage = i === messages.length - 1;
                  const isReadByOther = msg.readBy && msg.readBy.some(id => id !== user.id);
                  
                  const prevMsg = i > 0 ? messages[i - 1] : null;
                  const nextMsg = i < messages.length - 1 ? messages[i + 1] : null;
                  
                  const currentMsgDate = new Date(msg.createdAt);
                  const prevMsgDate = prevMsg ? new Date(prevMsg.createdAt) : null;
                  
                  const showDateDivider = !prevMsgDate || !isSameDay(currentMsgDate, prevMsgDate);
                  
                  let dateDividerText = "";
                  if (showDateDivider) {
                    if (isToday(currentMsgDate)) dateDividerText = "Today";
                    else if (isYesterday(currentMsgDate)) dateDividerText = "Yesterday";
                    else dateDividerText = format(currentMsgDate, "MMMM d, yyyy");
                  }
                  
                  const isFirstFromSender = !prevMsg || prevMsg.senderId !== msg.senderId || showDateDivider;
                  const isLastFromSender = !nextMsg || nextMsg.senderId !== msg.senderId;
                  
                  const showUsername = !isMe && msg.sender && activeRoom?.type !== 'direct' && isFirstFromSender;
                  const marginTopClass = i === 0 ? "mt-0" : (isFirstFromSender ? (showUsername ? "mt-0.5" : "mt-3") : "mt-0.5");
                  
                  let radiusClasses = "rounded-[22px]";
                  if (isMe) {
                    radiusClasses += isFirstFromSender ? " rounded-tr-[22px]" : " rounded-tr-[4px]";
                    radiusClasses += isLastFromSender ? " rounded-br-[22px]" : " rounded-br-[4px]";
                  } else {
                    radiusClasses += isFirstFromSender ? " rounded-tl-[22px]" : " rounded-tl-[4px]";
                    radiusClasses += isLastFromSender ? " rounded-bl-[22px]" : " rounded-bl-[4px]";
                  }
                  
                  return (
                    <React.Fragment key={msg.id || i}>
                      {showDateDivider && (
                        <div className="flex justify-center my-4 w-full">
                          <span className="text-[10px] font-medium font-mono uppercase tracking-wider text-ink-3 px-3 py-1">
                            {dateDividerText}
                          </span>
                        </div>
                      )}
                      <div className={`flex max-w-[85%] flex-col ${isMe ? "self-end items-end" : "self-start items-start"}`}>
                      {showUsername && (
                        <span className={`text-[11px] font-medium text-ink-3 ml-2 ${i === 0 ? "mt-0 mb-0.5" : "mt-4 mb-0.5"}`}>@{msg.sender.username}</span>
                      )}
                      <div className={`relative px-3.5 py-1.5 text-base md:text-sm min-w-[65px] ${marginTopClass} ${radiusClasses} ${isMe ? "bg-accent text-paper shadow-sm" : "bg-paper-3 text-ink shadow-sm border border-rule"}`}>
                        <span className="break-words whitespace-pre-wrap align-top leading-snug">{msg.content}</span>
                        <span className={`float-right ml-3 mt-1.5 flex items-center gap-1 text-[9px] ${isMe ? "text-paper/90" : "text-ink-3"}`}>
                          {format(new Date(msg.createdAt), "HH:mm")}
                          {isMe && (
                            <span className="flex items-center" title={isReadByOther ? "Read" : "Sent"}>
                                {isReadByOther ? (
                                    <CheckCheck size={14} strokeWidth={2.5} className="text-paper" />
                                ) : (
                                    <Check size={12} strokeWidth={2.5} className="text-paper/70" />
                                )}
                            </span>
                          )}
                        </span>
                        <div className="clear-both"></div>
                      </div>
                    </div>
                  </React.Fragment>
                )
                })
              ) : (
                <div className="flex flex-1 items-center justify-center flex-col text-ink-3 text-sm">
                  <MessageSquare size={32} className="mb-2 opacity-20" />
                  No messages yet. Be the first!
                </div>
              )}
              
              {activeRoom && typingUsers[activeRoom.id] && typingUsers[activeRoom.id].size > 0 && (
                <div className="flex self-start items-center gap-2 mb-2 ml-2">
                  <div className="flex bg-paper-3 rounded-2xl px-4 py-2 border border-rule items-center gap-1.5 h-[34px]">
                    <span className="w-1.5 h-1.5 bg-ink-3 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="w-1.5 h-1.5 bg-ink-3 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="w-1.5 h-1.5 bg-ink-3 rounded-full animate-bounce"></span>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            <div className="border-t border-rule bg-paper-2/50 p-3 backdrop-blur-sm">
              <form onSubmit={sendMessage} className="flex gap-2 relative">
                <input
                  type="text"
                  value={inputValue}
                  onChange={handleInputChange}
                  placeholder="Type a message..."
                  className="flex-1 rounded-full border border-rule bg-paper-2 px-4 py-2.5 text-base md:text-sm text-ink placeholder-ink-3 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                />
                <button
                  type="submit"
                  disabled={!inputValue.trim()}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                >
                  <Send size={16} className="ml-1" />
                </button>
              </form>
            </div>
          </>
        )}
      </div>

      <CreateRoomModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onRoomCreated={(room) => {
          setRooms(prev => [...prev, room]);
          joinRoom(room);
        }}
      />

      <JoinRoomModal
        isOpen={isJoinModalOpen}
        onClose={() => setIsJoinModalOpen(false)}
        onRoomJoined={(room) => {
          joinRoom(room);
        }}
      />
    </>
  );
}
