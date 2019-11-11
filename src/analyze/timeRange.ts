
class Node {
  constructor(
    public start: number,
    public end: number,
    public next?: Node,
  ) {}
}

export class TimeRange {
  private head: Node;
  private tail: Node;

  public add(start: number, end: number) {
    if (!this.head) {
      this.head = new Node(start, end);
      this.tail = this.head;
      return;
    }

    // if incoming node is faraway before firstnode
    if (end < this.head.start) {
      const node = new Node(start, end, this.head);
      this.head = node;
      // else, if incoming node is faraway after lastnode
    } else if (start > this.tail.end) {
      const node = new Node(start, end);
      this.tail.next = node;
      this.tail = node;
    } else {

      // otherwise, the incoming node cross or cover origin nodes
      const insertPoint = this.getLast(curr => curr && curr.start < start);
      const tailPoint = this.getFirst(curr => curr && curr.end > end);
      // both have insert pint and tail point, combine theses points
      if (insertPoint && tailPoint) {
        // cross two points
        if (insertPoint.end >= start && tailPoint.start <= end) {
          insertPoint.end = tailPoint.end;
          insertPoint.next = tailPoint.next;
        } else if (insertPoint.end > start) {
          insertPoint.end = end;
        } else if (tailPoint.start < end) {
          tailPoint.start = start;
        } else {
          const node = new Node(start, end, tailPoint);
          insertPoint.next = node;
        }
      }
      // no points
      else if (!insertPoint && !tailPoint) {
        this.head.next = null;
        Object.assign(this.head, { start, end });
      }
      // no insert point, insert before list
      else if (!insertPoint) {
        const node = tailPoint.start > end ?
          new Node(start, end, tailPoint) :
          new Node(start, tailPoint.end, tailPoint.next);
        this.head = node;
      }
      // no tail point, insert after list
      else {
        insertPoint.end = end;
        insertPoint.next = null;
        this.tail = insertPoint;
      }
    }
  }

  public reduce<T>(
    iterator: (prev: T, curr: Node) => T,
    initialValue?: T,
  ): T {
    if (typeof iterator !== 'function') {
      throw new Error(`${iterator} is not a function`);
    }
    let curr = this.head;
    let cumulative;
    if (arguments.length >= 2) {
      cumulative = initialValue;
    } else {
      cumulative = this.head;
      curr = curr.next;
    }

    do {
      cumulative = iterator(cumulative, curr);
    } while (curr && curr.next && (curr = curr.next));

    return cumulative;
  }

  public sum() {
    return this.reduce((sum, curr) => sum + (curr.end - curr.start), 0);
  }

  public toArray(): [number, number][] {
    return this.reduce((prev, curr) => {
      prev.push([curr.start, curr.end]);
      return prev;
    }, []);
  }

  public getFirst(
    comparator: (v: Node) => boolean,
    from = this.head
  ) {
    let found;
    let curr;
    for (curr = from; !!curr; curr = curr.next) {
      if (comparator(curr)) {
        found = curr;
        break
      }
    }
    return found;
  }

  public getLast(
    comparator: (v: Node) => boolean,
    from = this.head
  ) {
    let found;
    let curr;
    for (curr = from; !!curr; curr = curr.next) {
      if (comparator(curr)) {
        found = curr;
      } else {
        break;
      }
    }
    return found;
  }
}
