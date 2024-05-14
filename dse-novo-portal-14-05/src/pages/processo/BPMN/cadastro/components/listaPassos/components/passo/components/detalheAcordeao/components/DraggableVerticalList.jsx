import { useState } from 'react';
import ReactDOM from "react-dom";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import AcordeaoCampo from './acordeaoCampo/AcordeaoCampo'
import { useAtom } from "jotai"
import {Passos} from '../../../../../PassoAtom'
import update from 'immutability-helper';

const portal: HTMLElement = document.createElement("div");
portal.classList.add("my-super-portal");

if (!document.body) {
  throw new Error("body not ready for portal creation!");
}

document.body.appendChild(portal);

// a little function to help us with reordering the result
const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
};

const grid = 4;

const getItemStyle = (isDragging, draggableStyle) => ({
  // some basic styles to make the items look a bit nicer
  userSelect: "none",
//   padding: grid * 2,
//   margin: `0 0 ${grid}px 0`,

  // change background colour if dragging
  background: isDragging ? "#e0e0e0": "#f5f6f8",
  border: '1px solid #dadada',
  borderRadius: '5px',
  // background: '#bdbdbd',

  // styles we need to apply on draggables
  ...draggableStyle
});

const getListStyle = (isDraggingOver) => ({
  background: isDraggingOver ? "lightblue" : "lightgrey",
//   display: "flex",
  padding: grid,
//   overflow: "auto",
  width: '100%',
  minHeight : '72px',
  background: '#f1f1f1',
  border: '1px solid #dadada',
  borderRadius: '5px'
});
//Funções de ADD, REMOVE de itens padrão, e atualiza itens
export default function DraggableVerticalList(props) {

  const [items,setItems] = useState([])
  const [passos,setPassos] = useAtom(Passos)

  const onDragEnd = (result) => {
    // dropped outside the list
    if (!result.destination) {
      return;
    }

    setPassos(update(passos,{
      [props.index]:{
        campos: {
          $set: 
            reorder(
              passos[props.index].campos,
              result.source.index,
              result.destination.index
            )
        }
      }
    }))

  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="droppable">
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            style={getListStyle(snapshot.isDraggingOver)}
            {...provided.droppableProps}
          >
            {passos[props.index].campos.map((item, index) => (
              <Draggable key={item.id} draggableId={item.id} index={index}>
                {(provided, snapshot) => {
                  const child = (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      style={getItemStyle(
                        snapshot.isDragging,
                        provided.draggableProps.style
                      )}
                    >
                      <AcordeaoCampo index={props.index} campoIndex={index} />
                    </div>
                  )

                  const usePortal: boolean = snapshot.isDragging;

                  if (!usePortal) {
                    return child;
                  }

                  // if dragging - put the item in a portal
                  return ReactDOM.createPortal(child, portal);
                }}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}