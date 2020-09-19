import multer from "multer";

export const avatarUpload = multer({
	limits: {
		fileSize: 1000000
	},
	fileFilter(_req, file, cb) {
		if(!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
			return cb(new Error('Please upload an Image File!'));
		}

		cb(null, true);
	}
});