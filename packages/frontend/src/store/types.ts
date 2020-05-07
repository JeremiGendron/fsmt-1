import { Action } from "redux";
import { ThunkAction } from "redux-thunk";
import { TodoResource } from "backend/src/resources/todo";
import { RootState } from ".";

export const ADD_TODO = "ADD_TODO";
export type AddTodoAction = {
  type: typeof ADD_TODO;
  payload: TodoResource;
};

export const GET_TODOS_FETCHING = "GET_TODOS_FETCHING";
export type GetTodosFetchingAction = {
  type: typeof GET_TODOS_FETCHING;
  payload: boolean;
};

export const GET_TODOS_ERROR = "GET_TODOS_ERROR";
export type GetTodosErrorAction = {
  type: typeof GET_TODOS_ERROR;
  payload: string;
};

export type TodoActionType = AddTodoAction | GetTodosFetchingAction | GetTodosErrorAction; // | RemoveTodoAction

export type TodoStateTags = {
  [key: string]: {
    [key: string]: boolean;
  };
};

export type TodoState = {
  // mapping of todoId to TodoResource
  todos: {
    [key: string]: TodoResource;
  };
  // mapping of given tag to todoId to true/false
  tags: TodoStateTags;
  fetching: {
    getTodos: boolean;
    getTodo: boolean;
    postTodo: boolean;
  };
  errors: {
    getTodos: string;
    getTodo: string;
    postTodo: string;
  };
};

export type AppThunk<ReturnType = void> = ThunkAction<ReturnType, RootState, unknown, Action<string>>;
