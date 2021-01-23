import "./Item.css";
import React, { useState } from "react";
import { Controlled as ControlledZoom } from "react-medium-image-zoom";

import "react-medium-image-zoom/dist/styles.css";

import { IconButton, CircularProgress } from "@material-ui/core";
import { RemoveCircle } from "@material-ui/icons";

export default function Item(props) {
  const [url, setUrl] = useState(null);

  const [isZoom, setZoom] = useState(false);

  var file = props.file;
  var reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onloadend = function (e) {
    setUrl(reader.result);
  };

  return url !== null ? (
    <div className="u-item">
      {props.delete ? (
        <div className="u-edit">
          <div className="u-edit-button">
            <IconButton
              color="primary"
              aria-label="upload picture"
              component="span"
              onClick={() => props.onDelete()}
            >
              <RemoveCircle />
            </IconButton>
          </div>
        </div>
      ) : (
        <div></div>
      )}
      <div>
        <ControlledZoom
          isZoomed={isZoom}
          onZoomChange={(zoom) => setZoom(zoom)}
        >
          <div className="u-zoom">
            <img className="u-img" alt="" src={url}></img>
            <div className="u-title">Name: {file.name}</div>
            {file.detection ? (
              <div className="u-title">{file.detection}</div>
            ) : (
              <div />
            )}
          </div>
        </ControlledZoom>
      </div>
    </div>
  ) : (
    <div className="progress">
      <CircularProgress size="100px" color="secondary" />
    </div>
  );
}
