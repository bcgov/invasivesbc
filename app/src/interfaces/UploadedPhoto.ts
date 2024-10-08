interface UploadedPhoto {
  file_name: string;
  media_key?: string;
  encoded_file: string | undefined;
  description: string;
  editing: boolean;
}

export default UploadedPhoto;
