const { validateLinkService } = require('../services/validateLinkService.js');
const validateLinkController = async (req, res) => {
    const videoUrl = req.query.url;
    youtubeCheck = await validateLinkService(videoUrl);
    if (youtubeCheck.status !== 200) {
        res.status(200).json({
            success: false,
            data: null,
            message: youtubeCheck.message,
            status: youtubeCheck.status
        });
    }
    else {
        res.status(200).json({
            success: true,
            data: null,
            message: "YouTube link is valid",
            status: youtubeCheck.status
        });
    }

}

module.exports = {
    validateLinkController
}
