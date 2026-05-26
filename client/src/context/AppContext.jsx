import React, {
    createContext,
    useContext,
    useMemo,
    useState,
    useCallback,
} from "react";
import {
    CURRENT_USER,
    RESOURCES_SEED,
    QUESTIONS_SEED,
    NOTIFICATIONS_SEED,
} from "../data/mockData";

const AppContext = createContext(null);

export const useApp = () => {
    const ctx = useContext(AppContext);

    if (!ctx) {
        throw new Error("useApp must be used inside AppProvider");
    }

    return ctx;
};

let resourceCounter = 100;
let questionCounter = 100;
let commentCounter = 1000;
let answerCounter = 1000;
let notifCounter = 1000;

export function AppProvider({ children }) {
    const [resources, setResources] = useState(RESOURCES_SEED);
    const [questions, setQuestions] = useState(QUESTIONS_SEED);
    const [notifications, setNotifications] =
        useState(NOTIFICATIONS_SEED);

    const [bookmarks, setBookmarks] = useState(
        new Set(["r_003"])
    );

    // Track user votes:
    // { resource_<id>: "up"|"down", question_<id>: ..., answer_<id>: ... }
    const [votes, setVotes] = useState({});

    const currentUser = CURRENT_USER;

    const voteOn = useCallback(
        (kind, id, direction) => {
            const key = `${kind}_${id}`;

            setVotes((prev) => {
                const existing = prev[key];
                const next = { ...prev };

                if (existing === direction) {
                    delete next[key];
                } else {
                    next[key] = direction;
                }

                return next;
            });

            const delta = (existing) => {
                if (existing === direction) {
                    // toggling off
                    return direction === "up"
                        ? { upvotes: -1 }
                        : { downvotes: -1 };
                }

                if (existing && existing !== direction) {
                    // switching
                    return direction === "up"
                        ? { upvotes: +1, downvotes: -1 }
                        : { upvotes: -1, downvotes: +1 };
                }

                return direction === "up"
                    ? { upvotes: +1 }
                    : { downvotes: +1 };
            };

            const existing = votes[key];
            const d = delta(existing);

            if (kind === "resource") {
                setResources((rs) =>
                    rs.map((r) =>
                        r.id === id
                            ? {
                                ...r,
                                upvotes:
                                    (r.upvotes || 0) + (d.upvotes || 0),
                                downvotes:
                                    (r.downvotes || 0) +
                                    (d.downvotes || 0),
                            }
                            : r
                    )
                );
            } else if (kind === "question") {
                setQuestions((qs) =>
                    qs.map((q) =>
                        q.id === id
                            ? {
                                ...q,
                                upvotes:
                                    (q.upvotes || 0) + (d.upvotes || 0),
                                downvotes:
                                    (q.downvotes || 0) +
                                    (d.downvotes || 0),
                            }
                            : q
                    )
                );
            } else if (kind === "answer") {
                setQuestions((qs) =>
                    qs.map((q) => ({
                        ...q,
                        answers: q.answers.map((a) =>
                            a.id === id
                                ? {
                                    ...a,
                                    upvotes:
                                        (a.upvotes || 0) +
                                        (d.upvotes || 0),
                                    downvotes:
                                        (a.downvotes || 0) +
                                        (d.downvotes || 0),
                                }
                                : a
                        ),
                    }))
                );
            }
        },
        [votes]
    );

    const toggleBookmark = useCallback((id) => {
        setBookmarks((prev) => {
            const next = new Set(prev);

            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }

            return next;
        });
    }, []);

    const addResource = useCallback(
        (data) => {
            const id = `r_${++resourceCounter}`;
            const now = new Date().toISOString();

            const newResource = {
                id,
                ...data,
                uploader: currentUser,
                created_at: now,
                updated_at: now,
                upvotes: 0,
                downvotes: 0,
                views: 0,
                downloads: 0,
                bookmarks: 0,
                comments: [],
            };

            setResources((rs) => [newResource, ...rs]);

            return newResource;
        },
        [currentUser]
    );

    const updateResource = useCallback((id, patch) => {
        setResources((rs) =>
            rs.map((r) =>
                r.id === id
                    ? {
                        ...r,
                        ...patch,
                        updated_at: new Date().toISOString(),
                    }
                    : r
            )
        );
    }, []);

    const deleteResource = useCallback((id) => {
        setResources((rs) =>
            rs.filter((r) => r.id !== id)
        );
    }, []);

    const addCommentToResource = useCallback(
        (resourceId, text) => {
            const id = `c_${++commentCounter}`;

            setResources((rs) =>
                rs.map((r) =>
                    r.id === resourceId
                        ? {
                            ...r,
                            comments: [
                                ...(r.comments || []),
                                {
                                    id,
                                    author: currentUser,
                                    text,
                                    created_at:
                                        new Date().toISOString(),
                                },
                            ],
                        }
                        : r
                )
            );
        },
        [currentUser]
    );

    const addQuestion = useCallback(
        (data) => {
            const id = `q_${++questionCounter}`;
            const now = new Date().toISOString();

            const q = {
                id,
                ...data,
                author: currentUser,
                created_at: now,
                views: 0,
                upvotes: 0,
                downvotes: 0,
                answers: [],
            };

            setQuestions((qs) => [q, ...qs]);

            return q;
        },
        [currentUser]
    );

    const updateQuestion = useCallback((id, patch) => {
        setQuestions((qs) =>
            qs.map((q) =>
                q.id === id ? { ...q, ...patch } : q
            )
        );
    }, []);

    const deleteQuestion = useCallback((id) => {
        setQuestions((qs) =>
            qs.filter((q) => q.id !== id)
        );
    }, []);

    const addAnswer = useCallback(
        (questionId, body) => {
            const id = `a_${++answerCounter}`;

            setQuestions((qs) =>
                qs.map((q) =>
                    q.id === questionId
                        ? {
                            ...q,
                            answers: [
                                ...q.answers,
                                {
                                    id,
                                    author: currentUser,
                                    body,
                                    created_at:
                                        new Date().toISOString(),
                                    upvotes: 0,
                                    downvotes: 0,
                                    accepted: false,
                                    comments: [],
                                },
                            ],
                        }
                        : q
                )
            );
        },
        [currentUser]
    );

    const acceptAnswer = useCallback(
        (questionId, answerId) => {
            setQuestions((qs) =>
                qs.map((q) =>
                    q.id === questionId
                        ? {
                            ...q,
                            answers: q.answers.map((a) => ({
                                ...a,
                                accepted: a.id === answerId,
                            })),
                        }
                        : q
                )
            );
        },
        []
    );

    const incrementViews = useCallback(
        (kind, id) => {
            if (kind === "question") {
                setQuestions((qs) =>
                    qs.map((q) =>
                        q.id === id
                            ? {
                                ...q,
                                views: (q.views || 0) + 1,
                            }
                            : q
                    )
                );
            } else if (kind === "resource") {
                setResources((rs) =>
                    rs.map((r) =>
                        r.id === id
                            ? {
                                ...r,
                                views: (r.views || 0) + 1,
                            }
                            : r
                    )
                );
            }
        },
        []
    );

    const markNotifRead = useCallback((id) => {
        setNotifications((ns) =>
            ns.map((n) =>
                n.id === id
                    ? { ...n, read: true }
                    : n
            )
        );
    }, []);

    const markAllNotifsRead = useCallback(() => {
        setNotifications((ns) =>
            ns.map((n) => ({
                ...n,
                read: true,
            }))
        );
    }, []);

    const unreadCount = notifications.filter(
        (n) => !n.read
    ).length;

    const value = useMemo(
        () => ({
            currentUser,
            resources,
            questions,
            notifications,
            bookmarks,
            votes,
            unreadCount,
            voteOn,
            toggleBookmark,
            addResource,
            updateResource,
            deleteResource,
            addCommentToResource,
            addQuestion,
            updateQuestion,
            deleteQuestion,
            addAnswer,
            acceptAnswer,
            incrementViews,
            markNotifRead,
            markAllNotifsRead,
        }),
        [
            currentUser,
            resources,
            questions,
            notifications,
            bookmarks,
            votes,
            unreadCount,
            voteOn,
            toggleBookmark,
            addResource,
            updateResource,
            deleteResource,
            addCommentToResource,
            addQuestion,
            updateQuestion,
            deleteQuestion,
            addAnswer,
            acceptAnswer,
            incrementViews,
            markNotifRead,
            markAllNotifsRead,
        ]
    );

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    );
}