import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import {
    onAuthStateChanged,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInWithPopup,
    signOut,
    updateProfile,
    type User as FirebaseUser,
} from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';

interface User {
    id: string;
    name: string;
    email: string;
    photoURL?: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    signup: (name: string, email: string, password: string) => Promise<void>;
    logout: () => void;
    googleLogin: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function mapFirebaseUser(fbUser: FirebaseUser): User {
    return {
        id: fbUser.uid,
        name: fbUser.displayName || 'User',
        email: fbUser.email || '',
        photoURL: fbUser.photoURL || undefined,
    };
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
            if (fbUser) {
                setUser(mapFirebaseUser(fbUser));
                const idToken = await fbUser.getIdToken();
                setToken(idToken);
            } else {
                setUser(null);
                setToken(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const login = async (email: string, password: string) => {
        const result = await signInWithEmailAndPassword(auth, email, password);
        const idToken = await result.user.getIdToken();
        setUser(mapFirebaseUser(result.user));
        setToken(idToken);
    };

    const signup = async (name: string, email: string, password: string) => {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(result.user, { displayName: name });
        const idToken = await result.user.getIdToken();
        setUser({ ...mapFirebaseUser(result.user), name });
        setToken(idToken);
    };

    const googleLogin = async () => {
        const result = await signInWithPopup(auth, googleProvider);
        const idToken = await result.user.getIdToken();
        setUser(mapFirebaseUser(result.user));
        setToken(idToken);
    };

    const logout = () => {
        signOut(auth);
        setUser(null);
        setToken(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, loading, login, signup, logout, googleLogin }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
