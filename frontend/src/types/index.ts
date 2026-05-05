// User roles type definition
export type UserRole = 'admin' | 'comms' | 'pastoral' | 'member';

// Devotion type definition
export type Devotion = {
    id: string;
    title: string;
    content: string;
    date: Date;
};

// UserReflection type definition
export type UserReflection = {
    id: string;
    userId: string;
    reflection: string;
    date: Date;
};

// PrayerRequest type definition
export type PrayerRequest = {
    id: string;
    userId: string;
    request: string;
    date: Date;
};

// Conviction type definition
export type Conviction = {
    id: string;
    userId: string;
    conviction: string;
    date: Date;
};

// BlessingPrompt type definition
export type BlessingPrompt = {
    id: string;
    userId: string;
    prompt: string;
    date: Date;
};

// PhotoAlbum type definition
export type PhotoAlbum = {
    id: string;
    userId: string;
    photos: string[];
    date: Date;
};

// SermonNote type definition
export type SermonNote = {
    id: string;
    userId: string;
    notes: string;
    date: Date;
};

// Booklet type definition
export type Booklet = {
    id: string;
    userId: string;
    title: string;
    content: string;
    date: Date;
};

