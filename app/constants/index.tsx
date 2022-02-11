export const initialData = {
  tasks: {
    "task-0": {
      id: "task-0",
      title: "Take out the garbage",
      deadline: "10 feb",
      description: "Description",
      tags: ["gig"],
      assignee: "chaks.eth",
      reviewer: "0xavp.eth",
      reward: {
        chain: "polygon",
        value: 1000,
        token: "USDC",
      },
      activity: [
        {
          userAddress: "0x6304CE63F2EBf8C0Cc76b60d34Cc52a84aBB6057",
          timestamp: Date,
          title: "0xavp created this Task",
        },
      ],
    },
    "task-1": {
      id: "task-1",
      title: "Watch my favorite show",
      reward: 100,
      deadline: "15 feb",
    },
    "task-2": {
      id: "task-2",
      title: "Charge my phone",
      reward: 30,
      deadline: "25 feb",
    },
    "task-3": {
      id: "task-3",
      title: "Cook dinner",
      reward: 35,
      deadline: "3 mar",
    },
    "task-4": {
      id: "task-4",
      title: "Cook lunch",
      reward: 10,
      deadline: "23 jan",
    },
    "task-5": {
      id: "task-5",
      title: "Fix issue 34",
      reward: 65,
      deadline: "23 feb",
    },
    "task-6": {
      id: "task-6",
      title: "Get shipment",
      reward: 110,
      deadline: "13 feb",
    },
    "task-7": {
      id: "task-7",
      title: "Create header",
      reward: 20,
      deadline: "14 feb",
    },
    "task-8": {
      id: "task-8",
      title: "Fix issue 44",
      reward: 50,
      deadline: "18 feb",
    },
    "task-9": {
      id: "task-9",
      title: "Github integration",
      reward: 70,
      deadline: "1 mar",
    },
  },
  columns: {
    "column-0": {
      id: "column-0",
      title: "To do",
      taskIds: ["task-0", "task-1"],
    },
    "column-1": {
      id: "column-1",
      title: "Doing",
      taskIds: [
        "task-2",
        "task-3",
        "task-4",
        "task-6",
        "task-7",
        "task-8",
        "task-9",
      ],
    },
    "column-2": {
      id: "column-2",
      title: "Done",
      taskIds: ["task-5"],
    },
  },
  columnOrder: ["column-0", "column-1", "column-2"],
};