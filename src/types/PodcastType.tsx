export interface ExternalUrls {
    spotify: string;
  }
  
  export interface Image {
    url: string;
    height: number;
    width: number;
  }
  
  export interface ResumePoint {
    fully_played: boolean;
    resume_position_ms: number;
  }
  
  export interface Restrictions {
    reason: string;
  }
  
  export interface Show {
    available_markets: string[];
    copyrights: Copyright[];
    description: string;
    html_description: string;
    explicit: boolean;
    external_urls: ExternalUrls;
    href: string;
    id: string;
    images: Image[];
    is_externally_hosted: boolean;
    languages: string[];
    media_type: string;
    name: string;
    publisher: string;
    type: string;
    uri: string;
    total_episodes: number;
  }
  
  export interface Copyright {
    text: string;
    type: string;
  }
  
  export interface PodcastEpisode {
    audio_preview_url: string;
    description: string;
    html_description: string;
    duration_ms: number;
    explicit: boolean;
    external_urls: ExternalUrls;
    href: string;
    id: string;
    images: Image[];
    is_externally_hosted: boolean;
    is_playable: boolean;
    language: string;
    languages: string[];
    name: string;
    release_date: string;
    release_date_precision: string;
    resume_point: ResumePoint;
    type: string;
    uri: string;
    restrictions: Restrictions;
    show: Show;
  }
  