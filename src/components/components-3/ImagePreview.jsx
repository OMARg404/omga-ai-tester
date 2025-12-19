import { FaTimesCircle } from "react-icons/fa";
import "./ImagePreview.css";

const ImagePreview = ({ image, onRemove }) => {
  if (!image) return null;

  return (
    <div className="image-preview-container">
      <img className="image-preview-img" src={image} alt="preview" />
      <button className="image-preview-remove-btn" onClick={onRemove} title="Remove Image">
        <FaTimesCircle />
      </button>
    </div>
  );
};

export default ImagePreview;
