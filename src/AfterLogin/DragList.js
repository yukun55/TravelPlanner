import React, { useState, useEffect } from "react";
import { RightOutlined, MenuOutlined} from "@ant-design/icons";
import {Collapse} from "antd"
import {
  sortableContainer,
  sortableElement,
  sortableHandle
} from "react-sortable-hoc";
import arrayMove from "array-move";
import '../styles/RouteDrawer.css';
const { Panel } = Collapse;

const DragHandle = sortableHandle(() => <MenuOutlined style={{ cursor: 'grab', color: '#999' }}/>);

const SortableItem = sortableElement(({ value }) => (

      <div className='poi-item'>
        <DragHandle />
        {value.name}
      </div>

));

const SortableContainer = sortableContainer(({ children }) => {
  return (
    <Collapse
      bordered
      expandIcon={() => (
        <RightOutlined />
      )}
    >
      {children}
    </Collapse>
  );
});

export default function SortList({poiData}) {
  const [data, setData] = useState(poiData);

  /*
  useEffect(()=>{
    if (poiData === null) {
      console.log("poiData null");
      setData([]);
    }
    
    else {
      console.log("poiData non null");
      setData(poiData);
    }
      
    
  }, [poiData])
  */
  
  const onSortEnd = ({ oldIndex, newIndex }) =>
    setData(arrayMove(data, oldIndex, newIndex));

  return (
    <SortableContainer onSortEnd={onSortEnd} useDragHandle>
      {data.map((value, index) => {
        return (<SortableItem key={`item-${index}`} index={index} value={value} />)
      })}
    </SortableContainer>
  );
}
