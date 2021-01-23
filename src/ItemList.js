import Item from "./Item";
import "./Item.css";
export default function ItemList(props) {
  console.log(props.list);
  return (
    <div className="u-container">
      {props.list.map((e, index) => (
        <Item
          key={`${index}`}
          file={e}
          onDelete={() => props.onDelete(index)}
          delete={props.onDelete!==undefined}
        />
      ))}
    </div>
  );
}
