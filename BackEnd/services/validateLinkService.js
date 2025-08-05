const {checkYoutubeLink} = require("../utils/utils.js");


const validateLinkService =  async (videoUrl) => {
    console.log("Validating YouTube link:", videoUrl);
    const youtubeCheck = await checkYoutubeLink(videoUrl);
    return youtubeCheck;
}

module.exports = {validateLinkService};
