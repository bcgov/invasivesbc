interface UploadedPhoto {
  file_name: string;
  media_key?: string;
  encoded_file: string;
  description: string;
}

export default UploadedPhoto;
