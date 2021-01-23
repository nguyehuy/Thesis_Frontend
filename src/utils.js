import FoldersTree from "./FoldersTree";
import React, { useState, useEffect } from "react";
import { Button } from "@material-ui/core";
import Modal from "react-modal";
import { CircularProgress } from "@material-ui/core";
import "./utils.css";
const auth = require("solid-auth-client");
const FC = require("solid-file-client");
const fc = new FC(auth);
const customStyles = {
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    marginRight: "-50%",
    transform: "translate(-50%, -50%)",
  },
};

export const getFileStructure = async (url) => {
  try {
    if (await fc.itemExists(url)) {
      const folderData = await fc.readFolder(url, {
        links: FC.LINKS.EXCLUDE,
      });
      return folderData;
    }
  } catch (error) {
    console.error(error);
  }

  return null;
};

export const getFoldersForUrl = async (url) => {
  const fileStructure = await getFileStructure(url);

  const treeNode = {
    type: "folder",
    access: "public",
    url,
    children: [
      ...(await Promise.all(
        fileStructure?.folders.map((folder) => getFoldersForUrl(folder.url))
      )),
      ...fileStructure?.files.map((file) => ({
        type: "file",
        access: "public",
        url: file.url,
      })),
    ],
  };
  return treeNode;
};

export function SolidModal(props) {
  const [foldersTree, setFoldersTree] = useState();
  const [uploadUrl, setUploadUrl] = useState();
  const [open, setOpen] = useState();
  const updateFoldersTreeForUrl = async (url) => {
    const fol = await getFoldersForUrl(url);
    console.log(fol);
    setFoldersTree(fol);
  };
  useEffect(() => {
    updateFoldersTreeForUrl(props.rootUrl);
  }, []);

  return (
    <Modal
      style={customStyles}
      isOpen={props.isModalOpen}
      onRequestClose={() => props.modalClose()}
    >
      <div className="solid-modal">
        <div className="solid-modal-tree">
          <FoldersTree
            foldersTreeItems={foldersTree}
            onSelectNode={(event, url) => {
              setUploadUrl(url);
            }}
          />
        </div>
        <Button
          className="solid-button-confirm"
          variant="contained"
          color="secondary"
          maxW
          onClick={() => {
            setOpen(true);
            props.modalConfirm(uploadUrl);
            updateFoldersTreeForUrl(props.rootUrl).then(() => {
              setOpen(false);
            });
          }}
        >
          {open ? <CircularProgress color="inherit" /> : "CONFIRM"}
        </Button>
      </div>
    </Modal>
  );
}
