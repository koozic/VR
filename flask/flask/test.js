class Queue {
  #queue = [];

  constructor() {}

  enqueue(item) {
    this.queue.push(item);
  }

  dequeue() {
    return this.queue.shift();
  }

  print() {
    console.log(this.queue);
  }
}

class Stack {
  #stack = [];
}

const map = {};

map["a"] = 123;

Map;

console.log(map);

// const queue = new Queue();

// queue.enqueue("1");
// queue.enqueue(1);
// queue.enqueue([1, 2, 3]);
// queue.enqueue({ a: "test" });

// console.log(queue.dequeue());

// queue.print();
