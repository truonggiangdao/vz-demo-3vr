export default {
  tour: {
    // tour object detail
    id: '',
    name: '',
    googleAnalyticTrackingID: '',
    facebookPixelID: '',
    friendlyName: '',
    tagline: '',
    location: '',
    logoURL: '',
    menuHighlightColor: '',
    lightboxBackgroundColor1: '',
    lightboxBackgroundColor2: '',
    lightboxBackgroundColor3: '',
    lightboxHeaderColor: '',
    autoRotate: true,
    autoRotateSpeed: 0,
    defaultViewingAngle: [],
    mapCoordinates: [], // lng, lat, alt
    mapLightIntensity: 0,
    mapLightColor: 'white',
    websiteUrl: '',
    facebookUrl: '',
    instagramUrl: '',
    twitterUrl: '',
    snapchatUrl: '',
    youTubeUrl: '',
    pinterestUrl: '',
  },
  customer: {
    // customer object detail
    id: '',
    companyName: '',
    companyTagline: '',
    logoURL: '',
    companyDescription: '',
    friendlyName: '',
    email: '',
    websiteURL: '',
    brandColor1: '',
    brandColor2: '',
    facebookURL: '',
    instagramURL: '',
    twitterURL: '',
    snapchatURL: '',
    youTubeURL: '',
    pinterestURL: '',
  },
  scenes: [
    // list of all scenes of current tour
    {
      Id: '',
      Title: '',
      FriendlyName: '',
      Type: '',
      isDefault: false,
      Location: '',
      ViewingAngle: 0,
      DefaultOrientation: [],
      Coordinates: [],
      LensFlareLocation: [],
      noLensFlare: false,
      Yaw: '',
      Elevation: '',
      PreviewImgUrl: '',
      CubeMapImages: {
        1024: [
          '<Scene.1024-px-image-url>',
          '<Scene.1024-nx-image-url>',
          '<Scene.1024-py-image-url>',
          '<Scene.1024-ny-image-url>',
          '<Scene.1024-pz-image-url>',
          '<Scene.1024-nz-image-url>',
        ],
        2048: [
          '<Scene.2048-px-image-url>',
          '<Scene.2048-nx-image-url>',
          '<Scene.2048-py-image-url>',
          '<Scene.2048-ny-image-url>',
          '<Scene.2048-pz-image-url>',
          '<Scene.2048-nz-image-url>',
        ],
      },
      hotspots: [
        {
          Id: '',
          Type: '',
          Location: [],
          distance: '',
          SceneLinkId: '',
          MediaLinkId: '',
        },
      ],
    },
  ],
  media: [
    // list of all media of current tour
    {
      Id: '',
      Title: '',
      friendlyName: '',
      Type: '',
      Text: '',
      imageURL: '',
      ReadMoreURL: '',
      YoutubeID: '',
    },
  ],
  menu: [
    {
      name: '',
      order: 0,
      scenes: [
        {
          id: '',
          order: 0,
        },
      ],
    },
  ],
};
