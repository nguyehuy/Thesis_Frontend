import ItemList from "./ItemList";
import "./Result.css";
import React, { useState } from "react";

import FileSaver from "file-saver";
import JSZip from "jszip";
import { SolidModal } from "./utils";
import { Button, Typography } from "@material-ui/core";

const auth = require("solid-auth-client");
const FC = require("solid-file-client");
const fc = new FC(auth);

const saveFileToSolid = async (files, url) => {
  const urlUpload = `${url}${url.charAt(url.length - 1) === "/" ? "" : "/"}`;
  files.forEach(async (file) => {
    await fc.createFile(`${urlUpload + file.name}`, file, file.type);
  });
};

const handlerSaveFile = async (files) => {
  const zip = new JSZip();
  const errFolders = zip.folder("images");
  files.forEach((data) => {
    console.log(data);
    errFolders.file(data.name, data, {
      type: "blob",
    });
  });
  const content = await zip.generateAsync({ type: "blob" });
  FileSaver.saveAs(content, `output.zip`);
};

export default function Result(props) {
  return (
    <div className="rs">
      <ResultItem
        title="NO ERROR"
        fileList={props.listFileNoError}
        rootUrl={props.rootUrl}
      />
      <ResultItem
        title="ERROR"
        fileList={props.listFileError}
        rootUrl={props.rootUrl}
      />
    </div>
  );
}

function ResultItem(props) {
  const [isModalOpen, setModalOpen] = useState(false);
  const { fileList, rootUrl } = props;

  return (
    <div className="rs-list">
      <div>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <Typography color="secondary">{props.title}</Typography>
        </div>

        <div style={{ display: "flex", justifyContent: "center" }}>
          <SolidModal
            rootUrl={rootUrl}
            isModalOpen={isModalOpen}
            modalClose={() => setModalOpen(false)}
            modalConfirm={(url) => {
              saveFileToSolid(fileList, url);
            }}
          />
          <Button
            className="nav-btn"
            variant="contained"
            color="primary"
            onClick={() => handlerSaveFile(fileList)}
          >
            Download
            {/* <Archive /> */}
          </Button>

          <Button
            className="nav-btn"
            variant="contained"
            color="primary"
            onClick={() => setModalOpen(true)}
          >
            Upload To Solid
            {/* <CloudDownload /> */}
          </Button>
        </div>
      </div>
      <ItemList list={fileList} />
    </div>
  );
}
