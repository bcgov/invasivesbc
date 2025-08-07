interface PropTypes {
  x: number;
  y: number;
}

const Spacer = ({ x, y }: PropTypes) => <div style={{ width: `${x}px`, height: `${y}px` }} />;

export default Spacer;
