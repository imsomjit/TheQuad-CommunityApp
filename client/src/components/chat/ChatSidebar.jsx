import React, { useState, useEffect, useRef, useCallback } from "react";
import { MessageSquare, X, Hash, Users, Plus, Send, ChevronLeft, Loader2, Sparkles, Key, Copy, Check, Pin, PinOff } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { socket } from "../../services/socket";
import api, { getAccessToken, setAccessToken, authApi } from "../../services/api";
import { format } from "date-fns";
import { toast } from "sonner";
import CreateRoomModal from "./CreateRoomModal";
import JoinRoomModal from "./JoinRoomModal";

export default function ChatSidebar({ isOpen, onToggle, scrolled }) {
  const { user, isAuthenticated } = useAuth();
  
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
    if (isOpen && isAuthenticated) {
      fetchRooms();
      connectSocket();
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
      if (activeRoom && msg.roomId === activeRoom.id) {
        setMessages((prev) => [...prev, msg]);
        scrollToBottom();
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

    socket.on("receive_message", handleReceiveMessage);
    socket.on("connect", handleReconnect);
    socket.on("error", handleError);
    socket.on("connect_error", handleConnectError);
    
    return () => {
      socket.off("receive_message", handleReceiveMessage);
      socket.off("connect", handleReconnect);
      socket.off("error", handleError);
      socket.off("connect_error", handleConnectError);
    };
  }, [activeRoom]);

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
      // Try to reconnect before sending
      connectSocket();
      toast.info("Reconnecting... Please try again in a moment.");
      return;
    }

    socket.emit("send_message", {
      roomId: activeRoom.id,
      content: inputValue,
    });

    setInputValue("");
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
    try {
      await api.delete(`/chat/rooms/${roomId}/pin`);
      setRooms(prev => prev.map(r => r.id === roomId ? { ...r, isPinned: false } : r));
      toast.success("Room unpinned!");
    } catch (err) {
      toast.error("Failed to unpin room");
    }
  };

  if (!isAuthenticated) return null;

  const pinnedRooms = rooms.filter(r => r.isPinned);
  const regularRooms = rooms.filter(r => !r.isPinned);

  const renderRoom = (room) => (
    <button
      key={room.id}
      onClick={() => joinRoom(room)}
      className="group flex w-full items-center gap-3 rounded-lg border border-transparent p-3 text-left transition-colors hover:border-rule hover:bg-paper-2"
    >
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${room.type === 'ephemeral' ? 'bg-accent/10 text-accent' : 'bg-rule/50 text-ink-2'}`}>
        {room.type === "global" ? <Hash size={18} /> : room.type === "ephemeral" ? <Sparkles size={18} /> : <Users size={18} />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-base text-ink flex items-center gap-2 truncate">
          <span className="truncate">{room.name}</span>
          {room.type === "ephemeral" && <span className="rounded bg-accent/10 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-accent shrink-0">Live</span>}
        </p>
        <p className="text-sm text-ink-3 line-clamp-1">{room.description || "Join the discussion"}</p>
      </div>
      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
        {room.isPinned ? (
          <div 
            onClick={(e) => handleUnpin(e, room.id)}
            className="rounded p-1.5 text-accent hover:bg-rule"
            title="Unpin"
          >
            <PinOff size={16} />
          </div>
        ) : (
          <div 
            onClick={(e) => handlePin(e, room.id)}
            className="rounded p-1.5 text-ink-3 hover:text-accent hover:bg-rule"
            title="Pin"
          >
            <Pin size={16} />
          </div>
        )}
      </div>
    </button>
  );

  return (
    <>
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={onToggle}
          className="fixed bottom-6 right-6 z-50 hidden h-12 w-12 items-center justify-center rounded-full bg-accent text-rule shadow-lg shadow-accent/20 transition-transform hover:scale-110 active:scale-95 md:flex"
        >
          <MessageSquare size={22} />
        </button>
      )}

      <div
        ref={sidebarRef}
        style={{ touchAction: 'none' }} // Prevents browser from panning the whole page when dragging the sidebar
        className={`fixed right-0 z-50 flex w-full md:w-[22rem] transform flex-col border-l border-rule/70 bg-paper/95 backdrop-blur-xl transition-transform duration-300 ease-in-out md:z-30 top-0 md:bg-paper/50 md:backdrop-blur-md md:bottom-0 md:h-auto ${scrolled ? 'md:top-[56px]' : 'md:top-[92px]'} ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {isInitializing ? (
          <div className="flex h-full w-full flex-col items-center justify-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-accent" />
            <p className="text-xs font-mono tracking-wide text-ink-3 uppercase">Restoring Session...</p>
          </div>
        ) : !activeRoom ? (
          // --- ROOM LIST VIEW ---
          <>
            <div className="flex items-center justify-between border-b border-rule bg-paper-2/50 p-4 backdrop-blur-sm">
              <h2 className="font-mono text-xs uppercase tracking-wider text-ink font-semibold">Tech Lounges</h2>
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => setIsJoinModalOpen(true)}
                  className="rounded p-1 text-accent/70 hover:bg-rule"
                  title="Join Private Room"
                >
                  <Key size={18} />
                </button>
                <button 
                  onClick={() => setIsModalOpen(true)}
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
            
            <div className="flex-1 overflow-y-auto overscroll-contain p-4" style={{ touchAction: 'pan-y' }}>
              {loadingRooms ? (
                <div className="flex h-32 items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-ink-3" />
                </div>
              ) : rooms.length > 0 ? (
                <div className="space-y-4">
                  {pinnedRooms.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-bold uppercase tracking-wider text-ink-3 px-1">Pinned Lounges</p>
                      {pinnedRooms.map(renderRoom)}
                    </div>
                  )}
                  {regularRooms.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-bold uppercase tracking-wider text-ink-3 px-1">All Lounges</p>
                      {regularRooms.map(renderRoom)}
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-center text-sm text-ink-3 mt-10">No rooms available.</p>
              )}
            </div>
          </>
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
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/10 text-accent">
                    {activeRoom.type === "global" ? <Hash size={14} /> : activeRoom.type === "ephemeral" ? <Sparkles size={14} /> : <Users size={14} />}
                  </div>
                  <h2 className="font-medium text-base text-ink truncate max-w-[140px]">{activeRoom.name}</h2>
                  {!isConnected && (
                    <span className="flex h-2 w-2 rounded-full bg-yellow-500 animate-pulse" title="Connecting..."></span>
                  )}
                </div>
              </div>
              <button 
                onClick={onToggle}
                className="rounded p-1.5 text-ink-3 hover:bg-rule hover:text-ink transition-colors"
                title="Close Chat"
              >
                <X size={18} />
              </button>
            </div>

            {/* Secret Code Header for Private Rooms */}
            {activeRoom.isPrivate && (
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
            
            <div className="flex-1 overflow-y-auto overscroll-contain p-4 flex flex-col gap-3" style={{ touchAction: 'pan-y' }}>
              {loadingMessages ? (
                <div className="flex flex-1 items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-ink-3" />
                </div>
              ) : messages.length > 0 ? (
                messages.map((msg, i) => {
                  const isMe = msg.senderId === user.id;
                  return (
                    <div key={msg.id || i} className={`flex max-w-[85%] flex-col ${isMe ? "self-end items-end" : "self-start items-start"}`}>
                      {!isMe && msg.sender && (
                        <span className="mb-1 text-xs text-ink-3 ml-1">@{msg.sender.username}</span>
                      )}
                      <div className={`rounded-2xl px-4 py-2 text-base md:text-sm ${isMe ? "bg-accent text-paper rounded-tr-sm" : "bg-paper-3 text-ink rounded-tl-sm border border-rule"}`}>
                        {msg.content}
                      </div>
                      <span className="mt-1 text-xs text-ink-3 mx-1">
                        {format(new Date(msg.createdAt), "HH:mm")}
                      </span>
                    </div>
                  )
                })
              ) : (
                <div className="flex flex-1 items-center justify-center flex-col text-ink-3 text-sm">
                  <MessageSquare size={32} className="mb-2 opacity-20" />
                  No messages yet. Be the first!
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="border-t border-rule bg-paper-2/50 p-3 backdrop-blur-sm">
              <form onSubmit={sendMessage} className="flex gap-2 relative">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
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
          if (!room.isPrivate) {
            // Only add to global feed if not private
            setRooms(prev => [...prev, room]);
          }
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
