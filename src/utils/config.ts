const STYLE = {
  pageTitle: "font-serif italic text-4xl lg:text-6xl xl:text-8xl",
  
  // Mapbox style URLs - custom styles from Mapbox Studio
  // Format: "mapbox://styles/YOUR_USERNAME/YOUR_STYLE_ID"
  mapboxStyleLight: "mapbox://styles/luma1992/cmgm0efuc009c01r1e9ocacsy",
  mapboxStyleDark: "mapbox://styles/luma1992/cmgm7iata00s701se0rkba36o",
  
  // Legacy property for compatibility
  get mapboxStyle() {
    return this.mapboxStyleLight;
  },
  
  // Get map style based on theme
  getMapStyle: (isDark: boolean = false) => {
    return isDark ? STYLE.mapboxStyleDark : STYLE.mapboxStyleLight;
  }
};

export default STYLE;


