export interface ArtistInfo {
    id: string;
    name: string;
    // Null if genres aren't fetched yet.
    genres?: string[];
}

export interface TrackInfo {
    id: string;
    name: string;
    artists: ArtistInfo[];
    year: Number;
    previewUrl: string;
}