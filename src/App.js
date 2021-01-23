import "./App.css";
import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Input,
  Backdrop,
  CircularProgress,
  InputLabel,
  InputAdornment,
  Select,
  MenuItem,
} from "@material-ui/core";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import "react-tabs/style/react-tabs.css";
import {
  PlayArrow,
  RestoreFromTrash,
} from "@material-ui/icons";
import ItemList from "./ItemList";
import Result from "./Result";
import { fetchDocument } from "tripledoc";
import { foaf } from "rdf-namespaces";
import { Button, Typography } from "@material-ui/core";
import {
  SolidModal
} from "./utils";
const auth = require("solid-auth-client");

const FC = require("solid-file-client");
const fc = new FC(auth);

async function getCurrentSession() {
  let session = await auth.currentSession();
  return session;
}

function App() {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [open, setOpen] = useState(false);
  const [errorArr, setErrorArr] = useState([]);
  const [noErrorArr, setNoErrorArr] = useState([]);
  const [selectedTab, setSelectedTab] = useState(0);

  const [webId, setWebId] = useState(undefined);
  const [isModalOpen, setModalOpen] = useState(false);
  const [isLoadFromLocal, setLoadFromLocal] = useState(true);

  const [userName, setUserName] = useState(undefined);
  const [distance, setDistance] = useState(1);

  const onChangeHandler = (event) => {
    setSelectedFiles([...selectedFiles, ...event.target.files]);
  };
  const getUserName = async (webId) => {
    const profileDoc = await fetchDocument(webId);
    const profile = profileDoc.getSubject(webId);
    const name = profile.getString(foaf.name);

    return name;
  };
  const getRootUrl = (webId) => webId && webId.split("/").slice(0, 3).join("/");

  const handleLogin = async () => {
    const session = await auth.popupLogin({ popupUri: "popup.html" });

    if (session?.webId) {
      setWebId(session.webId);
    }
  };

  const handleUpdateUserInfo = async (webId) => {
    const name = await getUserName(webId);
    setUserName(name);
  };

  const handleLogout = async () => {
    await logout();
    setWebId(undefined);
  };

  const handleGetCurrentSession = async () => {
    const cachedSession = await getCurrentSession();

    if (cachedSession) {
      setWebId(cachedSession.webId);
    }
  };

  useEffect(() => {
    handleGetCurrentSession();
  }, []);

  useEffect(() => {
    if (webId) {
      handleUpdateUserInfo(webId);
    }
  }, [webId]);

  const onClickHandler = () => {
    const data = new FormData();
    setErrorArr([]);
    setNoErrorArr([]);
    for (let index = 0; index < selectedFiles.length; index++) {
      data.append("file", selectedFiles[index]);
    }
    setOpen(true);
    setSelectedTab(1);
    axios
      .post(`http://localhost:5000/upfile?distance=${distance}`, data, {})
      .then((res) => {
        const { noErrorArr, errorArr } = res.data;
        const errorFiles = errorArr.map((e) => {
          const file = new File(
            [new Blob([Buffer.from(e.file.data)])],
            e.filename
          );
          file.detection = `Number of detected components: ${e.info[1]}`;
          return file;
        });
        const noErrorFiles = noErrorArr.map((e) => {
          const file = new File(
            [new Blob([Buffer.from(e.file.data)])],
            e.filename
          );
          file.detection = `Number of detected components: ${e.info[1]}`;
          return file;
        });
        setNoErrorArr([...noErrorFiles]);
        setErrorArr([...errorFiles]);
      })
      .catch((error) => {
        console.log(error);
        setSelectedTab(0);
      })
      .then(() => {
        setOpen(false);
      });
  };

  const logout = () => {
    return auth.logout();
  };

  return (
    <div className="App">
      <Backdrop style={{ zIndex: 9999 }} open={open}>
        <CircularProgress color="inherit" />
      </Backdrop>
      <div>
        {webId ? (
          <div>
            <div className="nav-info">
              <Typography style={{ marginRight: "20px" }} color="secondary">
                Welcome back, {userName}
              </Typography>
              <Button
                className="nav-name"
                variant="contained"
                color="secondary"
                onClick={handleLogout}
              >
                Logout
              </Button>
            </div>

            <Tabs
              selectedIndex={selectedTab}
              onSelect={(number) => setSelectedTab(number)}
            >
              <TabList>
                <Tab>Input</Tab>
                <Tab>Output</Tab>
              </TabList>

              <TabPanel>
                <div className="nav">
                  <SolidModal
                    rootUrl={getRootUrl(webId)}
                    isModalOpen={isModalOpen}
                    modalClose={() => setModalOpen(false)}
                    modalConfirm={async (url) => {
                      const blob = await fc.readFile(url);
                      const name = url.substring(
                        url.lastIndexOf("/") + 1,
                        url.length
                      );
                      console.log(blob);
                      const file = new File([blob], name);

                      console.log(file);
                      setSelectedFiles([...selectedFiles, file]);
                    }}
                  />
                  <InputLabel
                    className="nav-e"
                    htmlFor="standard-adornment-amount"
                  >
                    Distance
                  </InputLabel>
                  <Input
                    id="standard-adornment-weight"
                    className="nav-e"
                    style={{ width: "70px" }}
                    value={distance}
                    onChange={(d) => setDistance(d.target.value)}
                    endAdornment={
                      <InputAdornment position="end">mm</InputAdornment>
                    }
                    aria-describedby="standard-weight-helper-text"
                    inputProps={{
                      "aria-label": "weight",
                    }}
                  />{" "}
                  <input
                    className="nav-e"
                    type="file"
                    id="file"
                    name="file"
                    style={{ display: "none" }}
                    multiple
                    onChange={onChangeHandler}
                  />
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => setModalOpen(!isLoadFromLocal)}
                  >
                    {isLoadFromLocal ? (
                      <label htmlFor="file">Load File From Local</label>
                    ) : (
                      "Load File From Solid"
                    )}
                  </Button>
                  <Select
                    className="select-store-file nav-e"
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    value={""}
                    onChange={(event) => {
                      setLoadFromLocal(event.target.value);
                    }}
                  >
                    <MenuItem value={false}>Load File From Solid</MenuItem>
                    <MenuItem value={true}>Load File From Local</MenuItem>
                  </Select>
                  <Button
                    type="button"
                    className="btn btn-success btn-block"
                    onClick={() => setSelectedFiles([])}
                    variant="contained"
                    color="primary"
                  >
                    Clear <RestoreFromTrash />
                  </Button>
                  <Button
                    style={{ marginRight: "10px", marginLeft: "auto" }}
                    variant="contained"
                    color="primary"
                    type="button"
                    className="btn btn-success btn-block"
                    onClick={onClickHandler}
                  >
                    Run <PlayArrow />
                  </Button>
                </div>

                <div className="body">
                  <ItemList
                    list={selectedFiles}
                    onDelete={(index) => {
                      console.log(index);
                      selectedFiles.splice(index, 1);
                      console.log(selectedFiles);
                      setSelectedFiles([...selectedFiles]);
                    }}
                  />
                </div>
              </TabPanel>
              <TabPanel>
                <Result
                  rootUrl={getRootUrl(webId)}
                  listFileError={errorArr}
                  listFileNoError={noErrorArr}
                />
              </TabPanel>
            </Tabs>
          </div>
        ) : (
          <div className="nav-login">
            <Button variant="contained" color="primary" onClick={handleLogin}>
              Login to continue
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
