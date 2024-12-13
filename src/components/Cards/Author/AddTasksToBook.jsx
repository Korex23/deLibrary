import React, { useState } from "react";
import { updateDoc, doc } from "firebase/firestore";
import { db } from "../../../firebase/config";

const AddTasksToBook = ({ id }) => {
  const [task, setTask] = useState("");
  const [tasks, setTasks] = useState([]);

  const addTask = async () => {
    if (task.trim() === "") {
      return;
    }

    const newTask = {
      task,
      answers: [],
    };

    try {
      await updateDoc(doc(db, "books", id), {
        question_answer: [...tasks, newTask],
      });
      setTasks([...tasks, newTask]);
      setTask("");
      console.log("Task added successfully!");
    } catch (error) {
      console.error("Error adding task:", error);
    }
  };

  return (
    <>
      <div>
        <input
          type="text"
          value={task}
          onChange={(e) => setTask(e.target.value)}
          className="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
        />
        <button
          onClick={addTask}
          className="w-full p-3 mt-6 text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
        >
          Add Task
        </button>
      </div>
    </>
  );
};

export default AddTasksToBook;
