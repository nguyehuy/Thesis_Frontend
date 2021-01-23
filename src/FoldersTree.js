import React from "react";
import { makeStyles } from "@material-ui/core";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";
import { TreeItem, TreeView } from "@material-ui/lab";

const formatURL = (url) => {
	if (url.endsWith("/")) {
		return url.split("/").reverse()[1];
	} else {
		return url.split("/").reverse()[0];
	}
};


const FoldersTree = (props) => {
	const classes = useStyles(props);
	const { foldersTreeItems, firstLayer = true, onSelectNode } = props;
	const wrapInRoot = (component) => {
		return (
			<TreeView
				className={classes.treeViewRoot}
				defaultCollapseIcon={<ExpandMoreIcon />}
				defaultExpandIcon={<ChevronRightIcon />}
				onNodeSelect={onSelectNode}
			>
				{component}
			</TreeView>
		);
    };
    
	if (!foldersTreeItems) {
		return null;
	} else {
		const { url } = foldersTreeItems;
		const isFolder = foldersTreeItems.type === "folder";
		const formattedUrl = firstLayer ? url : formatURL(url);

		const treeItem = isFolder ? (
			<TreeItem nodeId={url} label={formattedUrl} key={url}>
				{(foldersTreeItems).children.map((child) => (
					<FoldersTree onSelectNode={onSelectNode} foldersTreeItems={child} firstLayer={false} />
				))}
			</TreeItem>
		) : (
			<TreeItem
				nodeId={url}
				label={formattedUrl}
				key={url}
				classes={{ root: classes.fileNodeRoot }}
			/>
		);

		return firstLayer ? wrapInRoot(treeItem) : treeItem;
	}
};

const useStyles = makeStyles((theme) => ({
	treeViewRoot: {
		color: "#FF4234",
		textAlign: "left",
		maxWidth: 500,
	},
	fileNodeRoot: {
		color: "#333",
		backgroundColor: "#6F6",
		margin: theme.spacing(0.5),
	},
}));

export default FoldersTree;
