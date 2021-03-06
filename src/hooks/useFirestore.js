import { useEffect, useReducer, useState } from "react";
import { fbFirestore, timestamp } from "../config/firebase";

const initialState = {
  document: null,
  isPending: false,
  error: null,
  success: null,
};

const firestoreReducer = (state, action) => {
  switch (action.type) {
    case "IS_PENDING":
      return {
        isPending: true,
        document: null,
        error: null,
        success: false,
      };
    case "ADD_DOCUMENT":
      return {
        isPending: false,
        document: action.payload,
        error: null,
        success: true,
      };
    case "DELETE_DOCUMENT":
      return {
        isPending: false,
        document: null,
        error: null,
        success: true,
      };
    case "ERROR":
      return {
        isPending: false,
        document: null,
        error: action.payload,
        success: false,
      };
    default:
      return state;
  }
};

export default function useFirestore(collection) {
  const [response, dispatch] = useReducer(firestoreReducer, initialState);
  const [isCancelled, setIsCancelled] = useState(false);

  // collection ref
  const ref = fbFirestore.collection(collection);

  // only dispatch if not cancelled
  const dispatchIfNotCancelled = (action) => {
    if (!isCancelled) {
      dispatch(action);
    }
  };

  // add a document
  const addDocument = async (doc) => {
    dispatch({ type: "IS_PENDING" });

    try {
      // create timestamp object
      const createdAt = timestamp.fromDate(new Date());

      // add doc to firebase
      await ref.add({ ...doc, createdAt });

      // dispatch add document
      dispatchIfNotCancelled({ type: "ADD_DOCUMENT" });
    } catch (err) {
      console.log(err.message);
      // dispatch error
      dispatchIfNotCancelled({ type: "ERROR", payload: err.message });
    }
  };

  // delete a document
  const deleteDocument = async (id) => {
    dispatch({ type: "IS_PENDING" });

    try {
      // delete doc to firebase
      const deletedDocument = await ref.doc(id).delete();

      // dispatch add document
      dispatchIfNotCancelled({
        type: "DELETE_DOCUMENT",
        payload: deletedDocument,
      });
    } catch (err) {
      console.log(err.message);
      // dispatch error
      dispatchIfNotCancelled({ type: "ERROR", payload: err.message });
    }
  };

  useEffect(() => {
    // clean up
    return () => {
      setIsCancelled(true);
    };
  }, []);

  return { response, addDocument, deleteDocument };
}
