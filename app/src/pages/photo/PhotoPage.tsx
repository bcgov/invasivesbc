import { Container } from '@material-ui/core';
import PhotoContainer from 'components/photo/PhotoContainer';
import React from 'react';

interface IPhotoProps {
  classes?: any;
}

const PhotoPage: React.FC<IPhotoProps> = (props) => {
  return (
    <Container maxWidth="lg" className={props.classes.container}>
      <PhotoContainer />
    </Container>
  );
};

export default PhotoPage;
