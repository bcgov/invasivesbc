interface UploadedPhoto {
  file_name: string;
  encoded_file: string | undefined;
  description: string;
  editing: boolean;
}

export default UploadedPhoto;
