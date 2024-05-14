import React, { Component } from "react";
import ReactDOM from "react-dom";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { IconButton, Stack, Typography } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
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
  // padding: grid * 2,
  // margin: `0 ${grid}px 0 0`,

  // change background colour if dragging
  background: isDragging ? '#DFE3E8' : '#FFFFFF',
  border: '1px solid #dadada',
  borderRadius: 16,
  // background: '#bdbdbd',

  // styles we need to apply on draggables
  ...draggableStyle
});

const getListStyle = (isDraggingOver) => ({
  background: isDraggingOver ? "lightblue" : "lightgrey",
  display: "flex",
  padding: grid,
  overflow: "auto",
  width: '100%',
  minHeight : '0px',
  background: '#f1f1f1',
  border: '1px solid #dadada',
  borderRadius: 16
});
//Funções de ADD, REMOVE de itens padrão, e atualiza itens
export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      items: []
    };

    this.onDragEnd = this.onDragEnd.bind(this);
    this.addItem= this.addItem.bind(this);
    this.retornaItems = this.retornaItems.bind(this);
    this.removeItem = this.removeItem.bind(this);
    this.setaItems = this.setaItems.bind(this)
  }

  addItem(item){
    this.setState({
      items : [...this.state.items, item]
    })
  }

  removeItem(id){
    this.state.items.map((i,index) => {
      if(i.id == id){
        this.setState({
          items : update(this.state.items, {$splice: [[index, 1]] }) // remove o index correspondente
        })
      }
    })
  }

  retornaItems(){
    return this.state.items
  }

  setaItems(itens){
    this.setState({
      items : itens
    })
}

  onDragEnd(result) {
    // dropped outside the list
    if (!result.destination) {
      return;
    }

    const items = reorder(
      this.state.items,
      result.source.index,
      result.destination.index
    );

    this.setState({
      items
    });
  }

  render() {
    return (
      <>
      {this.state.items.length > 0 &&
      <DragDropContext onDragEnd={this.onDragEnd}>
        <Droppable droppableId="droppable" direction="horizontal">
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              style={getListStyle(snapshot.isDraggingOver)}
              {...provided.droppableProps}
            >
              {this.state.items.map((item, index) => (
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
                        <Stack direction='row' alignItems='center' spacing={1} sx={{margin:1}}>
                          <Typography variant='body2'>
                            {item.valor}
                          </Typography>
                          <IconButton aria-label="delete" onClick={()=>this.removeItem(item.id)}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Stack>
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
    }
    </>
    );
  }
}