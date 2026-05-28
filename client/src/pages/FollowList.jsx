import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Users, Loader2 } from "lucide-react";
import { usersApi } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { getAvatarFallback } from "../utils/fallbacks";

/**
 * Followers/Following list page — only accessible by the profile owner.
 * `mode` prop passed from App.jsx route: "followers" | "following"
 */
export default function FollowList({ mode = "followers" }) {
    const { username } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated, user: authUser } = useAuth();

    const [followers, setFollowers] = useState([]);
    const [following, setFollowing] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const isFollowers = mode === "followers";
    const title = isFollowers ? "Followers" : "Following";
    const list = isFollowers ? followers : following;

    // Redirect if not the profile owner
    useEffect(() => {
        if (!isAuthenticated) { navigate("/login"); return; }
        if (authUser && authUser.username !== username) {
            navigate(`/pv/${username}`);
            return;
        }
        
        setLoading(true);
        Promise.all([
            usersApi.getFollowers(username),
            usersApi.getFollowing(username)
        ])
        .then(([followersData, followingData]) => {
            setFollowers(followersData);
            setFollowing(followingData);
        })
        .catch(err => setError(err.response?.data?.message || "Failed to load"))
        .finally(() => setLoading(false));
    }, [username, isAuthenticated, authUser, navigate]);

    return (
        <div className="max-w-xl mx-auto fade-in-up space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3">
                <button onClick={() => navigate(`/pv/${username}`)}
                    className="rounded-sm p-1.5 text-ink-3 hover:bg-paper-2 hover:text-ink transition-colors">
                    <ArrowLeft className="w-4 h-4" />
                </button>
                <div>
                    <h1 className="font-display text-2xl font-bold text-ink">{title}</h1>
                    <p className="font-mono text-xs text-ink-3">@{username}</p>
                </div>
                <div className="ml-auto flex rounded-sm border border-rule overflow-hidden text-xs font-mono">
                    <Link to={`/pv/${username}/followers`}
                        className={`px-4 py-2 transition-colors ${isFollowers ? "bg-accent text-paper" : "text-ink-2 hover:bg-paper-2"}`}>
                        Followers
                    </Link>
                    <Link to={`/pv/${username}/following`}
                        className={`px-4 py-2 transition-colors ${!isFollowers ? "bg-accent text-paper" : "text-ink-2 hover:bg-paper-2"}`}>
                        Following
                    </Link>
                </div>
            </div>

            {/* List */}
            {loading ? (
                <div className="flex justify-center py-16">
                    <Loader2 className="w-7 h-7 animate-spin text-ink-3" />
                </div>
            ) : error ? (
                <div className="text-center py-12 text-ink-2 text-sm">{error}</div>
            ) : list.length === 0 ? (
                <div className="text-center py-16 border border-dashed border-rule rounded-sm">
                    <Users className="w-8 h-8 text-ink-3 mx-auto mb-3" />
                    <p className="text-ink-2 font-display text-lg">
                        {isFollowers ? "No followers yet" : "Not following anyone yet"}
                    </p>
                    <p className="text-xs text-ink-3 mt-1">
                        {isFollowers ? "Share your profile to grow your network." : "Explore and follow interesting peers."}
                    </p>
                </div>
            ) : (
                <div className="space-y-2">
                    {list.map(person => (
                        <UserRow key={person.id} person={person} />
                    ))}
                </div>
            )}
        </div>
    );
}

function UserRow({ person }) {
    const avatar = person.avatarUrl || getAvatarFallback(person.name, person.username);
    return (
        <Link to={`/pv/${person.username}`}
            className="flex items-center gap-3 p-4 rounded-sm border border-rule bg-paper-2/30 hover:border-ink-3 hover:bg-paper-2/60 transition-colors group">
            <img src={avatar} alt="" className="w-11 h-11 rounded-full object-cover shrink-0 bg-paper" />
            <div className="min-w-0 flex-1">
                <p className="font-display font-semibold text-ink group-hover:text-accent transition-colors truncate">{person.name}</p>
                <p className="font-mono text-xs text-ink-3 truncate">@{person.username}</p>
                {person.college && (
                    <p className="text-xs text-ink-3 mt-0.5 truncate">{person.college}{person.branch ? ` · ${person.branch}` : ""}</p>
                )}
            </div>
            <ArrowLeft className="w-4 h-4 text-ink-3 rotate-180 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
        </Link>
    );
}
