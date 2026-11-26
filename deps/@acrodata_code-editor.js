import {
  NG_VALUE_ACCESSOR
} from "./chunk-A3K6VADH.js";
import {
  autocompletion,
  closeBrackets,
  closeBracketsKeymap,
  completionKeymap
} from "./chunk-4GK4ZRVP.js";
import {
  Annotation,
  ChangeDesc,
  ChangeSet,
  CharCategory,
  Compartment,
  Decoration,
  Direction,
  EditorSelection,
  EditorState,
  EditorView,
  Facet,
  GutterMarker,
  HighlightStyle,
  IndentContext,
  NodeProp,
  Prec,
  RangeSet,
  RangeSetBuilder,
  StateEffect,
  StateField,
  StyleModule,
  Text,
  Transaction,
  ViewPlugin,
  WidgetType,
  bracketMatching,
  codePointAt,
  codePointSize,
  combineConfig,
  countColumn,
  crosshairCursor,
  defaultHighlightStyle,
  drawSelection,
  dropCursor,
  findClusterBreak,
  foldGutter,
  foldKeymap,
  fromCodePoint,
  getIndentUnit,
  getIndentation,
  getPanel,
  gutter,
  highlightActiveLine,
  highlightActiveLineGutter,
  highlightSpecialChars,
  highlightTree,
  highlightWhitespace,
  highlightingFor,
  hoverTooltip,
  indentOnInput,
  indentString,
  indentUnit,
  keymap,
  language,
  lineNumbers,
  logException,
  matchBrackets,
  placeholder,
  rectangularSelection,
  runScopeHandlers,
  showPanel,
  showTooltip,
  syntaxHighlighting,
  syntaxTree,
  tags
} from "./chunk-WHXF2DEB.js";
import "./chunk-EPEJIAJ2.js";
import "./chunk-SIJO4O3M.js";
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  NgModule,
  Output,
  ViewEncapsulation,
  booleanAttribute,
  forwardRef,
  setClassMetadata,
  ɵɵNgOnChangesFeature,
  ɵɵProvidersFeature,
  ɵɵdefineComponent,
  ɵɵdefineInjector,
  ɵɵdefineNgModule,
  ɵɵdirectiveInject
} from "./chunk-BO6GSTHD.js";
import "./chunk-EIB7IA3J.js";

// node_modules/@codemirror/commands/dist/index.js
var toggleComment = (target) => {
  let {
    state
  } = target, line = state.doc.lineAt(state.selection.main.from), config = getConfig(target.state, line.from);
  return config.line ? toggleLineComment(target) : config.block ? toggleBlockCommentByLine(target) : false;
};
function command(f, option) {
  return ({
    state,
    dispatch
  }) => {
    if (state.readOnly) return false;
    let tr = f(option, state);
    if (!tr) return false;
    dispatch(state.update(tr));
    return true;
  };
}
var toggleLineComment = command(
  changeLineComment,
  0
  /* CommentOption.Toggle */
);
var lineComment = command(
  changeLineComment,
  1
  /* CommentOption.Comment */
);
var lineUncomment = command(
  changeLineComment,
  2
  /* CommentOption.Uncomment */
);
var toggleBlockComment = command(
  changeBlockComment,
  0
  /* CommentOption.Toggle */
);
var blockComment = command(
  changeBlockComment,
  1
  /* CommentOption.Comment */
);
var blockUncomment = command(
  changeBlockComment,
  2
  /* CommentOption.Uncomment */
);
var toggleBlockCommentByLine = command(
  (o, s) => changeBlockComment(o, s, selectedLineRanges(s)),
  0
  /* CommentOption.Toggle */
);
function getConfig(state, pos) {
  let data = state.languageDataAt("commentTokens", pos, 1);
  return data.length ? data[0] : {};
}
var SearchMargin = 50;
function findBlockComment(state, {
  open,
  close
}, from, to) {
  let textBefore = state.sliceDoc(from - SearchMargin, from);
  let textAfter = state.sliceDoc(to, to + SearchMargin);
  let spaceBefore = /\s*$/.exec(textBefore)[0].length, spaceAfter = /^\s*/.exec(textAfter)[0].length;
  let beforeOff = textBefore.length - spaceBefore;
  if (textBefore.slice(beforeOff - open.length, beforeOff) == open && textAfter.slice(spaceAfter, spaceAfter + close.length) == close) {
    return {
      open: {
        pos: from - spaceBefore,
        margin: spaceBefore && 1
      },
      close: {
        pos: to + spaceAfter,
        margin: spaceAfter && 1
      }
    };
  }
  let startText, endText;
  if (to - from <= 2 * SearchMargin) {
    startText = endText = state.sliceDoc(from, to);
  } else {
    startText = state.sliceDoc(from, from + SearchMargin);
    endText = state.sliceDoc(to - SearchMargin, to);
  }
  let startSpace = /^\s*/.exec(startText)[0].length, endSpace = /\s*$/.exec(endText)[0].length;
  let endOff = endText.length - endSpace - close.length;
  if (startText.slice(startSpace, startSpace + open.length) == open && endText.slice(endOff, endOff + close.length) == close) {
    return {
      open: {
        pos: from + startSpace + open.length,
        margin: /\s/.test(startText.charAt(startSpace + open.length)) ? 1 : 0
      },
      close: {
        pos: to - endSpace - close.length,
        margin: /\s/.test(endText.charAt(endOff - 1)) ? 1 : 0
      }
    };
  }
  return null;
}
function selectedLineRanges(state) {
  let ranges = [];
  for (let r of state.selection.ranges) {
    let fromLine2 = state.doc.lineAt(r.from);
    let toLine2 = r.to <= fromLine2.to ? fromLine2 : state.doc.lineAt(r.to);
    if (toLine2.from > fromLine2.from && toLine2.from == r.to) toLine2 = r.to == fromLine2.to + 1 ? fromLine2 : state.doc.lineAt(r.to - 1);
    let last = ranges.length - 1;
    if (last >= 0 && ranges[last].to > fromLine2.from) ranges[last].to = toLine2.to;
    else ranges.push({
      from: fromLine2.from + /^\s*/.exec(fromLine2.text)[0].length,
      to: toLine2.to
    });
  }
  return ranges;
}
function changeBlockComment(option, state, ranges = state.selection.ranges) {
  let tokens = ranges.map((r) => getConfig(state, r.from).block);
  if (!tokens.every((c) => c)) return null;
  let comments = ranges.map((r, i) => findBlockComment(state, tokens[i], r.from, r.to));
  if (option != 2 && !comments.every((c) => c)) {
    return {
      changes: state.changes(ranges.map((range, i) => {
        if (comments[i]) return [];
        return [{
          from: range.from,
          insert: tokens[i].open + " "
        }, {
          from: range.to,
          insert: " " + tokens[i].close
        }];
      }))
    };
  } else if (option != 1 && comments.some((c) => c)) {
    let changes = [];
    for (let i = 0, comment; i < comments.length; i++) if (comment = comments[i]) {
      let token = tokens[i], {
        open,
        close
      } = comment;
      changes.push({
        from: open.pos - token.open.length,
        to: open.pos + open.margin
      }, {
        from: close.pos - close.margin,
        to: close.pos + token.close.length
      });
    }
    return {
      changes
    };
  }
  return null;
}
function changeLineComment(option, state, ranges = state.selection.ranges) {
  let lines = [];
  let prevLine = -1;
  for (let {
    from,
    to
  } of ranges) {
    let startI = lines.length, minIndent = 1e9;
    let token = getConfig(state, from).line;
    if (!token) continue;
    for (let pos = from; pos <= to; ) {
      let line = state.doc.lineAt(pos);
      if (line.from > prevLine && (from == to || to > line.from)) {
        prevLine = line.from;
        let indent = /^\s*/.exec(line.text)[0].length;
        let empty2 = indent == line.length;
        let comment = line.text.slice(indent, indent + token.length) == token ? indent : -1;
        if (indent < line.text.length && indent < minIndent) minIndent = indent;
        lines.push({
          line,
          comment,
          token,
          indent,
          empty: empty2,
          single: false
        });
      }
      pos = line.to + 1;
    }
    if (minIndent < 1e9) {
      for (let i = startI; i < lines.length; i++) if (lines[i].indent < lines[i].line.text.length) lines[i].indent = minIndent;
    }
    if (lines.length == startI + 1) lines[startI].single = true;
  }
  if (option != 2 && lines.some((l) => l.comment < 0 && (!l.empty || l.single))) {
    let changes = [];
    for (let {
      line,
      token,
      indent,
      empty: empty2,
      single
    } of lines) if (single || !empty2) changes.push({
      from: line.from + indent,
      insert: token + " "
    });
    let changeSet = state.changes(changes);
    return {
      changes: changeSet,
      selection: state.selection.map(changeSet, 1)
    };
  } else if (option != 1 && lines.some((l) => l.comment >= 0)) {
    let changes = [];
    for (let {
      line,
      comment,
      token
    } of lines) if (comment >= 0) {
      let from = line.from + comment, to = from + token.length;
      if (line.text[to - line.from] == " ") to++;
      changes.push({
        from,
        to
      });
    }
    return {
      changes
    };
  }
  return null;
}
var fromHistory = Annotation.define();
var isolateHistory = Annotation.define();
var invertedEffects = Facet.define();
var historyConfig = Facet.define({
  combine(configs) {
    return combineConfig(configs, {
      minDepth: 100,
      newGroupDelay: 500,
      joinToEvent: (_t, isAdjacent2) => isAdjacent2
    }, {
      minDepth: Math.max,
      newGroupDelay: Math.min,
      joinToEvent: (a, b) => (tr, adj) => a(tr, adj) || b(tr, adj)
    });
  }
});
var historyField_ = StateField.define({
  create() {
    return HistoryState.empty;
  },
  update(state, tr) {
    let config = tr.state.facet(historyConfig);
    let fromHist = tr.annotation(fromHistory);
    if (fromHist) {
      let item = HistEvent.fromTransaction(tr, fromHist.selection), from = fromHist.side;
      let other = from == 0 ? state.undone : state.done;
      if (item) other = updateBranch(other, other.length, config.minDepth, item);
      else other = addSelection(other, tr.startState.selection);
      return new HistoryState(from == 0 ? fromHist.rest : other, from == 0 ? other : fromHist.rest);
    }
    let isolate = tr.annotation(isolateHistory);
    if (isolate == "full" || isolate == "before") state = state.isolate();
    if (tr.annotation(Transaction.addToHistory) === false) return !tr.changes.empty ? state.addMapping(tr.changes.desc) : state;
    let event = HistEvent.fromTransaction(tr);
    let time = tr.annotation(Transaction.time), userEvent = tr.annotation(Transaction.userEvent);
    if (event) state = state.addChanges(event, time, userEvent, config, tr);
    else if (tr.selection) state = state.addSelection(tr.startState.selection, time, userEvent, config.newGroupDelay);
    if (isolate == "full" || isolate == "after") state = state.isolate();
    return state;
  },
  toJSON(value) {
    return {
      done: value.done.map((e) => e.toJSON()),
      undone: value.undone.map((e) => e.toJSON())
    };
  },
  fromJSON(json) {
    return new HistoryState(json.done.map(HistEvent.fromJSON), json.undone.map(HistEvent.fromJSON));
  }
});
function history(config = {}) {
  return [historyField_, historyConfig.of(config), EditorView.domEventHandlers({
    beforeinput(e, view) {
      let command2 = e.inputType == "historyUndo" ? undo : e.inputType == "historyRedo" ? redo : null;
      if (!command2) return false;
      e.preventDefault();
      return command2(view);
    }
  })];
}
function cmd(side, selection2) {
  return function({
    state,
    dispatch
  }) {
    if (!selection2 && state.readOnly) return false;
    let historyState = state.field(historyField_, false);
    if (!historyState) return false;
    let tr = historyState.pop(side, state, selection2);
    if (!tr) return false;
    dispatch(tr);
    return true;
  };
}
var undo = cmd(0, false);
var redo = cmd(1, false);
var undoSelection = cmd(0, true);
var redoSelection = cmd(1, true);
function depth(side) {
  return function(state) {
    let histState = state.field(historyField_, false);
    if (!histState) return 0;
    let branch = side == 0 ? histState.done : histState.undone;
    return branch.length - (branch.length && !branch[0].changes ? 1 : 0);
  };
}
var undoDepth = depth(
  0
  /* BranchName.Done */
);
var redoDepth = depth(
  1
  /* BranchName.Undone */
);
var HistEvent = class _HistEvent {
  constructor(changes, effects, mapped, startSelection, selectionsAfter) {
    this.changes = changes;
    this.effects = effects;
    this.mapped = mapped;
    this.startSelection = startSelection;
    this.selectionsAfter = selectionsAfter;
  }
  setSelAfter(after) {
    return new _HistEvent(this.changes, this.effects, this.mapped, this.startSelection, after);
  }
  toJSON() {
    var _a, _b, _c;
    return {
      changes: (_a = this.changes) === null || _a === void 0 ? void 0 : _a.toJSON(),
      mapped: (_b = this.mapped) === null || _b === void 0 ? void 0 : _b.toJSON(),
      startSelection: (_c = this.startSelection) === null || _c === void 0 ? void 0 : _c.toJSON(),
      selectionsAfter: this.selectionsAfter.map((s) => s.toJSON())
    };
  }
  static fromJSON(json) {
    return new _HistEvent(json.changes && ChangeSet.fromJSON(json.changes), [], json.mapped && ChangeDesc.fromJSON(json.mapped), json.startSelection && EditorSelection.fromJSON(json.startSelection), json.selectionsAfter.map(EditorSelection.fromJSON));
  }
  // This does not check `addToHistory` and such, it assumes the
  // transaction needs to be converted to an item. Returns null when
  // there are no changes or effects in the transaction.
  static fromTransaction(tr, selection2) {
    let effects = none;
    for (let invert of tr.startState.facet(invertedEffects)) {
      let result = invert(tr);
      if (result.length) effects = effects.concat(result);
    }
    if (!effects.length && tr.changes.empty) return null;
    return new _HistEvent(tr.changes.invert(tr.startState.doc), effects, void 0, selection2 || tr.startState.selection, none);
  }
  static selection(selections) {
    return new _HistEvent(void 0, none, void 0, void 0, selections);
  }
};
function updateBranch(branch, to, maxLen, newEvent) {
  let start = to + 1 > maxLen + 20 ? to - maxLen - 1 : 0;
  let newBranch = branch.slice(start, to);
  newBranch.push(newEvent);
  return newBranch;
}
function isAdjacent(a, b) {
  let ranges = [], isAdjacent2 = false;
  a.iterChangedRanges((f, t) => ranges.push(f, t));
  b.iterChangedRanges((_f, _t, f, t) => {
    for (let i = 0; i < ranges.length; ) {
      let from = ranges[i++], to = ranges[i++];
      if (t >= from && f <= to) isAdjacent2 = true;
    }
  });
  return isAdjacent2;
}
function eqSelectionShape(a, b) {
  return a.ranges.length == b.ranges.length && a.ranges.filter((r, i) => r.empty != b.ranges[i].empty).length === 0;
}
function conc(a, b) {
  return !a.length ? b : !b.length ? a : a.concat(b);
}
var none = [];
var MaxSelectionsPerEvent = 200;
function addSelection(branch, selection2) {
  if (!branch.length) {
    return [HistEvent.selection([selection2])];
  } else {
    let lastEvent = branch[branch.length - 1];
    let sels = lastEvent.selectionsAfter.slice(Math.max(0, lastEvent.selectionsAfter.length - MaxSelectionsPerEvent));
    if (sels.length && sels[sels.length - 1].eq(selection2)) return branch;
    sels.push(selection2);
    return updateBranch(branch, branch.length - 1, 1e9, lastEvent.setSelAfter(sels));
  }
}
function popSelection(branch) {
  let last = branch[branch.length - 1];
  let newBranch = branch.slice();
  newBranch[branch.length - 1] = last.setSelAfter(last.selectionsAfter.slice(0, last.selectionsAfter.length - 1));
  return newBranch;
}
function addMappingToBranch(branch, mapping) {
  if (!branch.length) return branch;
  let length = branch.length, selections = none;
  while (length) {
    let event = mapEvent(branch[length - 1], mapping, selections);
    if (event.changes && !event.changes.empty || event.effects.length) {
      let result = branch.slice(0, length);
      result[length - 1] = event;
      return result;
    } else {
      mapping = event.mapped;
      length--;
      selections = event.selectionsAfter;
    }
  }
  return selections.length ? [HistEvent.selection(selections)] : none;
}
function mapEvent(event, mapping, extraSelections) {
  let selections = conc(event.selectionsAfter.length ? event.selectionsAfter.map((s) => s.map(mapping)) : none, extraSelections);
  if (!event.changes) return HistEvent.selection(selections);
  let mappedChanges = event.changes.map(mapping), before = mapping.mapDesc(event.changes, true);
  let fullMapping = event.mapped ? event.mapped.composeDesc(before) : before;
  return new HistEvent(mappedChanges, StateEffect.mapEffects(event.effects, mapping), fullMapping, event.startSelection.map(before), selections);
}
var joinableUserEvent = /^(input\.type|delete)($|\.)/;
var HistoryState = class _HistoryState {
  constructor(done, undone, prevTime = 0, prevUserEvent = void 0) {
    this.done = done;
    this.undone = undone;
    this.prevTime = prevTime;
    this.prevUserEvent = prevUserEvent;
  }
  isolate() {
    return this.prevTime ? new _HistoryState(this.done, this.undone) : this;
  }
  addChanges(event, time, userEvent, config, tr) {
    let done = this.done, lastEvent = done[done.length - 1];
    if (lastEvent && lastEvent.changes && !lastEvent.changes.empty && event.changes && (!userEvent || joinableUserEvent.test(userEvent)) && (!lastEvent.selectionsAfter.length && time - this.prevTime < config.newGroupDelay && config.joinToEvent(tr, isAdjacent(lastEvent.changes, event.changes)) || // For compose (but not compose.start) events, always join with previous event
    userEvent == "input.type.compose")) {
      done = updateBranch(done, done.length - 1, config.minDepth, new HistEvent(event.changes.compose(lastEvent.changes), conc(StateEffect.mapEffects(event.effects, lastEvent.changes), lastEvent.effects), lastEvent.mapped, lastEvent.startSelection, none));
    } else {
      done = updateBranch(done, done.length, config.minDepth, event);
    }
    return new _HistoryState(done, none, time, userEvent);
  }
  addSelection(selection2, time, userEvent, newGroupDelay) {
    let last = this.done.length ? this.done[this.done.length - 1].selectionsAfter : none;
    if (last.length > 0 && time - this.prevTime < newGroupDelay && userEvent == this.prevUserEvent && userEvent && /^select($|\.)/.test(userEvent) && eqSelectionShape(last[last.length - 1], selection2)) return this;
    return new _HistoryState(addSelection(this.done, selection2), this.undone, time, userEvent);
  }
  addMapping(mapping) {
    return new _HistoryState(addMappingToBranch(this.done, mapping), addMappingToBranch(this.undone, mapping), this.prevTime, this.prevUserEvent);
  }
  pop(side, state, onlySelection) {
    let branch = side == 0 ? this.done : this.undone;
    if (branch.length == 0) return null;
    let event = branch[branch.length - 1], selection2 = event.selectionsAfter[0] || state.selection;
    if (onlySelection && event.selectionsAfter.length) {
      return state.update({
        selection: event.selectionsAfter[event.selectionsAfter.length - 1],
        annotations: fromHistory.of({
          side,
          rest: popSelection(branch),
          selection: selection2
        }),
        userEvent: side == 0 ? "select.undo" : "select.redo",
        scrollIntoView: true
      });
    } else if (!event.changes) {
      return null;
    } else {
      let rest = branch.length == 1 ? none : branch.slice(0, branch.length - 1);
      if (event.mapped) rest = addMappingToBranch(rest, event.mapped);
      return state.update({
        changes: event.changes,
        selection: event.startSelection,
        effects: event.effects,
        annotations: fromHistory.of({
          side,
          rest,
          selection: selection2
        }),
        filter: false,
        userEvent: side == 0 ? "undo" : "redo",
        scrollIntoView: true
      });
    }
  }
};
HistoryState.empty = new HistoryState(none, none);
var historyKeymap = [{
  key: "Mod-z",
  run: undo,
  preventDefault: true
}, {
  key: "Mod-y",
  mac: "Mod-Shift-z",
  run: redo,
  preventDefault: true
}, {
  linux: "Ctrl-Shift-z",
  run: redo,
  preventDefault: true
}, {
  key: "Mod-u",
  run: undoSelection,
  preventDefault: true
}, {
  key: "Alt-u",
  mac: "Mod-Shift-u",
  run: redoSelection,
  preventDefault: true
}];
function updateSel(sel, by) {
  return EditorSelection.create(sel.ranges.map(by), sel.mainIndex);
}
function setSel(state, selection2) {
  return state.update({
    selection: selection2,
    scrollIntoView: true,
    userEvent: "select"
  });
}
function moveSel({
  state,
  dispatch
}, how) {
  let selection2 = updateSel(state.selection, how);
  if (selection2.eq(state.selection, true)) return false;
  dispatch(setSel(state, selection2));
  return true;
}
function rangeEnd(range, forward) {
  return EditorSelection.cursor(forward ? range.to : range.from);
}
function cursorByChar(view, forward) {
  return moveSel(view, (range) => range.empty ? view.moveByChar(range, forward) : rangeEnd(range, forward));
}
function ltrAtCursor(view) {
  return view.textDirectionAt(view.state.selection.main.head) == Direction.LTR;
}
var cursorCharLeft = (view) => cursorByChar(view, !ltrAtCursor(view));
var cursorCharRight = (view) => cursorByChar(view, ltrAtCursor(view));
function cursorByGroup(view, forward) {
  return moveSel(view, (range) => range.empty ? view.moveByGroup(range, forward) : rangeEnd(range, forward));
}
var cursorGroupLeft = (view) => cursorByGroup(view, !ltrAtCursor(view));
var cursorGroupRight = (view) => cursorByGroup(view, ltrAtCursor(view));
var segmenter = typeof Intl != "undefined" && Intl.Segmenter ? new Intl.Segmenter(void 0, {
  granularity: "word"
}) : null;
function interestingNode(state, node, bracketProp) {
  if (node.type.prop(bracketProp)) return true;
  let len = node.to - node.from;
  return len && (len > 2 || /[^\s,.;:]/.test(state.sliceDoc(node.from, node.to))) || node.firstChild;
}
function moveBySyntax(state, start, forward) {
  let pos = syntaxTree(state).resolveInner(start.head);
  let bracketProp = forward ? NodeProp.closedBy : NodeProp.openedBy;
  for (let at = start.head; ; ) {
    let next = forward ? pos.childAfter(at) : pos.childBefore(at);
    if (!next) break;
    if (interestingNode(state, next, bracketProp)) pos = next;
    else at = forward ? next.to : next.from;
  }
  let bracket = pos.type.prop(bracketProp), match, newPos;
  if (bracket && (match = forward ? matchBrackets(state, pos.from, 1) : matchBrackets(state, pos.to, -1)) && match.matched) newPos = forward ? match.end.to : match.end.from;
  else newPos = forward ? pos.to : pos.from;
  return EditorSelection.cursor(newPos, forward ? -1 : 1);
}
var cursorSyntaxLeft = (view) => moveSel(view, (range) => moveBySyntax(view.state, range, !ltrAtCursor(view)));
var cursorSyntaxRight = (view) => moveSel(view, (range) => moveBySyntax(view.state, range, ltrAtCursor(view)));
function cursorByLine(view, forward) {
  return moveSel(view, (range) => {
    if (!range.empty) return rangeEnd(range, forward);
    let moved = view.moveVertically(range, forward);
    return moved.head != range.head ? moved : view.moveToLineBoundary(range, forward);
  });
}
var cursorLineUp = (view) => cursorByLine(view, false);
var cursorLineDown = (view) => cursorByLine(view, true);
function pageInfo(view) {
  let selfScroll = view.scrollDOM.clientHeight < view.scrollDOM.scrollHeight - 2;
  let marginTop = 0, marginBottom = 0, height;
  if (selfScroll) {
    for (let source of view.state.facet(EditorView.scrollMargins)) {
      let margins = source(view);
      if (margins === null || margins === void 0 ? void 0 : margins.top) marginTop = Math.max(margins === null || margins === void 0 ? void 0 : margins.top, marginTop);
      if (margins === null || margins === void 0 ? void 0 : margins.bottom) marginBottom = Math.max(margins === null || margins === void 0 ? void 0 : margins.bottom, marginBottom);
    }
    height = view.scrollDOM.clientHeight - marginTop - marginBottom;
  } else {
    height = (view.dom.ownerDocument.defaultView || window).innerHeight;
  }
  return {
    marginTop,
    marginBottom,
    selfScroll,
    height: Math.max(view.defaultLineHeight, height - 5)
  };
}
function cursorByPage(view, forward) {
  let page = pageInfo(view);
  let {
    state
  } = view, selection2 = updateSel(state.selection, (range) => {
    return range.empty ? view.moveVertically(range, forward, page.height) : rangeEnd(range, forward);
  });
  if (selection2.eq(state.selection)) return false;
  let effect;
  if (page.selfScroll) {
    let startPos = view.coordsAtPos(state.selection.main.head);
    let scrollRect = view.scrollDOM.getBoundingClientRect();
    let scrollTop = scrollRect.top + page.marginTop, scrollBottom = scrollRect.bottom - page.marginBottom;
    if (startPos && startPos.top > scrollTop && startPos.bottom < scrollBottom) effect = EditorView.scrollIntoView(selection2.main.head, {
      y: "start",
      yMargin: startPos.top - scrollTop
    });
  }
  view.dispatch(setSel(state, selection2), {
    effects: effect
  });
  return true;
}
var cursorPageUp = (view) => cursorByPage(view, false);
var cursorPageDown = (view) => cursorByPage(view, true);
function moveByLineBoundary(view, start, forward) {
  let line = view.lineBlockAt(start.head), moved = view.moveToLineBoundary(start, forward);
  if (moved.head == start.head && moved.head != (forward ? line.to : line.from)) moved = view.moveToLineBoundary(start, forward, false);
  if (!forward && moved.head == line.from && line.length) {
    let space = /^\s*/.exec(view.state.sliceDoc(line.from, Math.min(line.from + 100, line.to)))[0].length;
    if (space && start.head != line.from + space) moved = EditorSelection.cursor(line.from + space);
  }
  return moved;
}
var cursorLineBoundaryForward = (view) => moveSel(view, (range) => moveByLineBoundary(view, range, true));
var cursorLineBoundaryBackward = (view) => moveSel(view, (range) => moveByLineBoundary(view, range, false));
var cursorLineBoundaryLeft = (view) => moveSel(view, (range) => moveByLineBoundary(view, range, !ltrAtCursor(view)));
var cursorLineBoundaryRight = (view) => moveSel(view, (range) => moveByLineBoundary(view, range, ltrAtCursor(view)));
var cursorLineStart = (view) => moveSel(view, (range) => EditorSelection.cursor(view.lineBlockAt(range.head).from, 1));
var cursorLineEnd = (view) => moveSel(view, (range) => EditorSelection.cursor(view.lineBlockAt(range.head).to, -1));
function toMatchingBracket(state, dispatch, extend) {
  let found = false, selection2 = updateSel(state.selection, (range) => {
    let matching = matchBrackets(state, range.head, -1) || matchBrackets(state, range.head, 1) || range.head > 0 && matchBrackets(state, range.head - 1, 1) || range.head < state.doc.length && matchBrackets(state, range.head + 1, -1);
    if (!matching || !matching.end) return range;
    found = true;
    let head = matching.start.from == range.head ? matching.end.to : matching.end.from;
    return extend ? EditorSelection.range(range.anchor, head) : EditorSelection.cursor(head);
  });
  if (!found) return false;
  dispatch(setSel(state, selection2));
  return true;
}
var cursorMatchingBracket = ({
  state,
  dispatch
}) => toMatchingBracket(state, dispatch, false);
function extendSel(target, how) {
  let selection2 = updateSel(target.state.selection, (range) => {
    let head = how(range);
    return EditorSelection.range(range.anchor, head.head, head.goalColumn, head.bidiLevel || void 0);
  });
  if (selection2.eq(target.state.selection)) return false;
  target.dispatch(setSel(target.state, selection2));
  return true;
}
function selectByChar(view, forward) {
  return extendSel(view, (range) => view.moveByChar(range, forward));
}
var selectCharLeft = (view) => selectByChar(view, !ltrAtCursor(view));
var selectCharRight = (view) => selectByChar(view, ltrAtCursor(view));
function selectByGroup(view, forward) {
  return extendSel(view, (range) => view.moveByGroup(range, forward));
}
var selectGroupLeft = (view) => selectByGroup(view, !ltrAtCursor(view));
var selectGroupRight = (view) => selectByGroup(view, ltrAtCursor(view));
var selectSyntaxLeft = (view) => extendSel(view, (range) => moveBySyntax(view.state, range, !ltrAtCursor(view)));
var selectSyntaxRight = (view) => extendSel(view, (range) => moveBySyntax(view.state, range, ltrAtCursor(view)));
function selectByLine(view, forward) {
  return extendSel(view, (range) => view.moveVertically(range, forward));
}
var selectLineUp = (view) => selectByLine(view, false);
var selectLineDown = (view) => selectByLine(view, true);
function selectByPage(view, forward) {
  return extendSel(view, (range) => view.moveVertically(range, forward, pageInfo(view).height));
}
var selectPageUp = (view) => selectByPage(view, false);
var selectPageDown = (view) => selectByPage(view, true);
var selectLineBoundaryForward = (view) => extendSel(view, (range) => moveByLineBoundary(view, range, true));
var selectLineBoundaryBackward = (view) => extendSel(view, (range) => moveByLineBoundary(view, range, false));
var selectLineBoundaryLeft = (view) => extendSel(view, (range) => moveByLineBoundary(view, range, !ltrAtCursor(view)));
var selectLineBoundaryRight = (view) => extendSel(view, (range) => moveByLineBoundary(view, range, ltrAtCursor(view)));
var selectLineStart = (view) => extendSel(view, (range) => EditorSelection.cursor(view.lineBlockAt(range.head).from));
var selectLineEnd = (view) => extendSel(view, (range) => EditorSelection.cursor(view.lineBlockAt(range.head).to));
var cursorDocStart = ({
  state,
  dispatch
}) => {
  dispatch(setSel(state, {
    anchor: 0
  }));
  return true;
};
var cursorDocEnd = ({
  state,
  dispatch
}) => {
  dispatch(setSel(state, {
    anchor: state.doc.length
  }));
  return true;
};
var selectDocStart = ({
  state,
  dispatch
}) => {
  dispatch(setSel(state, {
    anchor: state.selection.main.anchor,
    head: 0
  }));
  return true;
};
var selectDocEnd = ({
  state,
  dispatch
}) => {
  dispatch(setSel(state, {
    anchor: state.selection.main.anchor,
    head: state.doc.length
  }));
  return true;
};
var selectAll = ({
  state,
  dispatch
}) => {
  dispatch(state.update({
    selection: {
      anchor: 0,
      head: state.doc.length
    },
    userEvent: "select"
  }));
  return true;
};
var selectLine = ({
  state,
  dispatch
}) => {
  let ranges = selectedLineBlocks(state).map(({
    from,
    to
  }) => EditorSelection.range(from, Math.min(to + 1, state.doc.length)));
  dispatch(state.update({
    selection: EditorSelection.create(ranges),
    userEvent: "select"
  }));
  return true;
};
var selectParentSyntax = ({
  state,
  dispatch
}) => {
  let selection2 = updateSel(state.selection, (range) => {
    let tree = syntaxTree(state), stack = tree.resolveStack(range.from, 1);
    if (range.empty) {
      let stackBefore = tree.resolveStack(range.from, -1);
      if (stackBefore.node.from >= stack.node.from && stackBefore.node.to <= stack.node.to) stack = stackBefore;
    }
    for (let cur = stack; cur; cur = cur.next) {
      let {
        node
      } = cur;
      if ((node.from < range.from && node.to >= range.to || node.to > range.to && node.from <= range.from) && cur.next) return EditorSelection.range(node.to, node.from);
    }
    return range;
  });
  if (selection2.eq(state.selection)) return false;
  dispatch(setSel(state, selection2));
  return true;
};
var simplifySelection = ({
  state,
  dispatch
}) => {
  let cur = state.selection, selection2 = null;
  if (cur.ranges.length > 1) selection2 = EditorSelection.create([cur.main]);
  else if (!cur.main.empty) selection2 = EditorSelection.create([EditorSelection.cursor(cur.main.head)]);
  if (!selection2) return false;
  dispatch(setSel(state, selection2));
  return true;
};
function deleteBy(target, by) {
  if (target.state.readOnly) return false;
  let event = "delete.selection", {
    state
  } = target;
  let changes = state.changeByRange((range) => {
    let {
      from,
      to
    } = range;
    if (from == to) {
      let towards = by(range);
      if (towards < from) {
        event = "delete.backward";
        towards = skipAtomic(target, towards, false);
      } else if (towards > from) {
        event = "delete.forward";
        towards = skipAtomic(target, towards, true);
      }
      from = Math.min(from, towards);
      to = Math.max(to, towards);
    } else {
      from = skipAtomic(target, from, false);
      to = skipAtomic(target, to, true);
    }
    return from == to ? {
      range
    } : {
      changes: {
        from,
        to
      },
      range: EditorSelection.cursor(from, from < range.head ? -1 : 1)
    };
  });
  if (changes.changes.empty) return false;
  target.dispatch(state.update(changes, {
    scrollIntoView: true,
    userEvent: event,
    effects: event == "delete.selection" ? EditorView.announce.of(state.phrase("Selection deleted")) : void 0
  }));
  return true;
}
function skipAtomic(target, pos, forward) {
  if (target instanceof EditorView) for (let ranges of target.state.facet(EditorView.atomicRanges).map((f) => f(target))) ranges.between(pos, pos, (from, to) => {
    if (from < pos && to > pos) pos = forward ? to : from;
  });
  return pos;
}
var deleteByChar = (target, forward, byIndentUnit) => deleteBy(target, (range) => {
  let pos = range.from, {
    state
  } = target, line = state.doc.lineAt(pos), before, targetPos;
  if (byIndentUnit && !forward && pos > line.from && pos < line.from + 200 && !/[^ \t]/.test(before = line.text.slice(0, pos - line.from))) {
    if (before[before.length - 1] == "	") return pos - 1;
    let col = countColumn(before, state.tabSize), drop = col % getIndentUnit(state) || getIndentUnit(state);
    for (let i = 0; i < drop && before[before.length - 1 - i] == " "; i++) pos--;
    targetPos = pos;
  } else {
    targetPos = findClusterBreak(line.text, pos - line.from, forward, forward) + line.from;
    if (targetPos == pos && line.number != (forward ? state.doc.lines : 1)) targetPos += forward ? 1 : -1;
    else if (!forward && /[\ufe00-\ufe0f]/.test(line.text.slice(targetPos - line.from, pos - line.from))) targetPos = findClusterBreak(line.text, targetPos - line.from, false, false) + line.from;
  }
  return targetPos;
});
var deleteCharBackward = (view) => deleteByChar(view, false, true);
var deleteCharForward = (view) => deleteByChar(view, true, false);
var deleteByGroup = (target, forward) => deleteBy(target, (range) => {
  let pos = range.head, {
    state
  } = target, line = state.doc.lineAt(pos);
  let categorize = state.charCategorizer(pos);
  for (let cat = null; ; ) {
    if (pos == (forward ? line.to : line.from)) {
      if (pos == range.head && line.number != (forward ? state.doc.lines : 1)) pos += forward ? 1 : -1;
      break;
    }
    let next = findClusterBreak(line.text, pos - line.from, forward) + line.from;
    let nextChar = line.text.slice(Math.min(pos, next) - line.from, Math.max(pos, next) - line.from);
    let nextCat = categorize(nextChar);
    if (cat != null && nextCat != cat) break;
    if (nextChar != " " || pos != range.head) cat = nextCat;
    pos = next;
  }
  return pos;
});
var deleteGroupBackward = (target) => deleteByGroup(target, false);
var deleteGroupForward = (target) => deleteByGroup(target, true);
var deleteToLineEnd = (view) => deleteBy(view, (range) => {
  let lineEnd = view.lineBlockAt(range.head).to;
  return range.head < lineEnd ? lineEnd : Math.min(view.state.doc.length, range.head + 1);
});
var deleteLineBoundaryBackward = (view) => deleteBy(view, (range) => {
  let lineStart = view.moveToLineBoundary(range, false).head;
  return range.head > lineStart ? lineStart : Math.max(0, range.head - 1);
});
var deleteLineBoundaryForward = (view) => deleteBy(view, (range) => {
  let lineStart = view.moveToLineBoundary(range, true).head;
  return range.head < lineStart ? lineStart : Math.min(view.state.doc.length, range.head + 1);
});
var splitLine = ({
  state,
  dispatch
}) => {
  if (state.readOnly) return false;
  let changes = state.changeByRange((range) => {
    return {
      changes: {
        from: range.from,
        to: range.to,
        insert: Text.of(["", ""])
      },
      range: EditorSelection.cursor(range.from)
    };
  });
  dispatch(state.update(changes, {
    scrollIntoView: true,
    userEvent: "input"
  }));
  return true;
};
var transposeChars = ({
  state,
  dispatch
}) => {
  if (state.readOnly) return false;
  let changes = state.changeByRange((range) => {
    if (!range.empty || range.from == 0 || range.from == state.doc.length) return {
      range
    };
    let pos = range.from, line = state.doc.lineAt(pos);
    let from = pos == line.from ? pos - 1 : findClusterBreak(line.text, pos - line.from, false) + line.from;
    let to = pos == line.to ? pos + 1 : findClusterBreak(line.text, pos - line.from, true) + line.from;
    return {
      changes: {
        from,
        to,
        insert: state.doc.slice(pos, to).append(state.doc.slice(from, pos))
      },
      range: EditorSelection.cursor(to)
    };
  });
  if (changes.changes.empty) return false;
  dispatch(state.update(changes, {
    scrollIntoView: true,
    userEvent: "move.character"
  }));
  return true;
};
function selectedLineBlocks(state) {
  let blocks = [], upto = -1;
  for (let range of state.selection.ranges) {
    let startLine = state.doc.lineAt(range.from), endLine = state.doc.lineAt(range.to);
    if (!range.empty && range.to == endLine.from) endLine = state.doc.lineAt(range.to - 1);
    if (upto >= startLine.number) {
      let prev = blocks[blocks.length - 1];
      prev.to = endLine.to;
      prev.ranges.push(range);
    } else {
      blocks.push({
        from: startLine.from,
        to: endLine.to,
        ranges: [range]
      });
    }
    upto = endLine.number + 1;
  }
  return blocks;
}
function moveLine(state, dispatch, forward) {
  if (state.readOnly) return false;
  let changes = [], ranges = [];
  for (let block of selectedLineBlocks(state)) {
    if (forward ? block.to == state.doc.length : block.from == 0) continue;
    let nextLine = state.doc.lineAt(forward ? block.to + 1 : block.from - 1);
    let size = nextLine.length + 1;
    if (forward) {
      changes.push({
        from: block.to,
        to: nextLine.to
      }, {
        from: block.from,
        insert: nextLine.text + state.lineBreak
      });
      for (let r of block.ranges) ranges.push(EditorSelection.range(Math.min(state.doc.length, r.anchor + size), Math.min(state.doc.length, r.head + size)));
    } else {
      changes.push({
        from: nextLine.from,
        to: block.from
      }, {
        from: block.to,
        insert: state.lineBreak + nextLine.text
      });
      for (let r of block.ranges) ranges.push(EditorSelection.range(r.anchor - size, r.head - size));
    }
  }
  if (!changes.length) return false;
  dispatch(state.update({
    changes,
    scrollIntoView: true,
    selection: EditorSelection.create(ranges, state.selection.mainIndex),
    userEvent: "move.line"
  }));
  return true;
}
var moveLineUp = ({
  state,
  dispatch
}) => moveLine(state, dispatch, false);
var moveLineDown = ({
  state,
  dispatch
}) => moveLine(state, dispatch, true);
function copyLine(state, dispatch, forward) {
  if (state.readOnly) return false;
  let changes = [];
  for (let block of selectedLineBlocks(state)) {
    if (forward) changes.push({
      from: block.from,
      insert: state.doc.slice(block.from, block.to) + state.lineBreak
    });
    else changes.push({
      from: block.to,
      insert: state.lineBreak + state.doc.slice(block.from, block.to)
    });
  }
  dispatch(state.update({
    changes,
    scrollIntoView: true,
    userEvent: "input.copyline"
  }));
  return true;
}
var copyLineUp = ({
  state,
  dispatch
}) => copyLine(state, dispatch, false);
var copyLineDown = ({
  state,
  dispatch
}) => copyLine(state, dispatch, true);
var deleteLine = (view) => {
  if (view.state.readOnly) return false;
  let {
    state
  } = view, changes = state.changes(selectedLineBlocks(state).map(({
    from,
    to
  }) => {
    if (from > 0) from--;
    else if (to < state.doc.length) to++;
    return {
      from,
      to
    };
  }));
  let selection2 = updateSel(state.selection, (range) => {
    let dist = void 0;
    if (view.lineWrapping) {
      let block = view.lineBlockAt(range.head), pos = view.coordsAtPos(range.head, range.assoc || 1);
      if (pos) dist = block.bottom + view.documentTop - pos.bottom + view.defaultLineHeight / 2;
    }
    return view.moveVertically(range, true, dist);
  }).map(changes);
  view.dispatch({
    changes,
    selection: selection2,
    scrollIntoView: true,
    userEvent: "delete.line"
  });
  return true;
};
function isBetweenBrackets(state, pos) {
  if (/\(\)|\[\]|\{\}/.test(state.sliceDoc(pos - 1, pos + 1))) return {
    from: pos,
    to: pos
  };
  let context = syntaxTree(state).resolveInner(pos);
  let before = context.childBefore(pos), after = context.childAfter(pos), closedBy;
  if (before && after && before.to <= pos && after.from >= pos && (closedBy = before.type.prop(NodeProp.closedBy)) && closedBy.indexOf(after.name) > -1 && state.doc.lineAt(before.to).from == state.doc.lineAt(after.from).from && !/\S/.test(state.sliceDoc(before.to, after.from))) return {
    from: before.to,
    to: after.from
  };
  return null;
}
var insertNewlineAndIndent = newlineAndIndent(false);
var insertBlankLine = newlineAndIndent(true);
function newlineAndIndent(atEof) {
  return ({
    state,
    dispatch
  }) => {
    if (state.readOnly) return false;
    let changes = state.changeByRange((range) => {
      let {
        from,
        to
      } = range, line = state.doc.lineAt(from);
      let explode = !atEof && from == to && isBetweenBrackets(state, from);
      if (atEof) from = to = (to <= line.to ? line : state.doc.lineAt(to)).to;
      let cx = new IndentContext(state, {
        simulateBreak: from,
        simulateDoubleBreak: !!explode
      });
      let indent = getIndentation(cx, from);
      if (indent == null) indent = countColumn(/^\s*/.exec(state.doc.lineAt(from).text)[0], state.tabSize);
      while (to < line.to && /\s/.test(line.text[to - line.from])) to++;
      if (explode) ({
        from,
        to
      } = explode);
      else if (from > line.from && from < line.from + 100 && !/\S/.test(line.text.slice(0, from))) from = line.from;
      let insert = ["", indentString(state, indent)];
      if (explode) insert.push(indentString(state, cx.lineIndent(line.from, -1)));
      return {
        changes: {
          from,
          to,
          insert: Text.of(insert)
        },
        range: EditorSelection.cursor(from + 1 + insert[1].length)
      };
    });
    dispatch(state.update(changes, {
      scrollIntoView: true,
      userEvent: "input"
    }));
    return true;
  };
}
function changeBySelectedLine(state, f) {
  let atLine = -1;
  return state.changeByRange((range) => {
    let changes = [];
    for (let pos = range.from; pos <= range.to; ) {
      let line = state.doc.lineAt(pos);
      if (line.number > atLine && (range.empty || range.to > line.from)) {
        f(line, changes, range);
        atLine = line.number;
      }
      pos = line.to + 1;
    }
    let changeSet = state.changes(changes);
    return {
      changes,
      range: EditorSelection.range(changeSet.mapPos(range.anchor, 1), changeSet.mapPos(range.head, 1))
    };
  });
}
var indentSelection = ({
  state,
  dispatch
}) => {
  if (state.readOnly) return false;
  let updated = /* @__PURE__ */ Object.create(null);
  let context = new IndentContext(state, {
    overrideIndentation: (start) => {
      let found = updated[start];
      return found == null ? -1 : found;
    }
  });
  let changes = changeBySelectedLine(state, (line, changes2, range) => {
    let indent = getIndentation(context, line.from);
    if (indent == null) return;
    if (!/\S/.test(line.text)) indent = 0;
    let cur = /^\s*/.exec(line.text)[0];
    let norm = indentString(state, indent);
    if (cur != norm || range.from < line.from + cur.length) {
      updated[line.from] = indent;
      changes2.push({
        from: line.from,
        to: line.from + cur.length,
        insert: norm
      });
    }
  });
  if (!changes.changes.empty) dispatch(state.update(changes, {
    userEvent: "indent"
  }));
  return true;
};
var indentMore = ({
  state,
  dispatch
}) => {
  if (state.readOnly) return false;
  dispatch(state.update(changeBySelectedLine(state, (line, changes) => {
    changes.push({
      from: line.from,
      insert: state.facet(indentUnit)
    });
  }), {
    userEvent: "input.indent"
  }));
  return true;
};
var indentLess = ({
  state,
  dispatch
}) => {
  if (state.readOnly) return false;
  dispatch(state.update(changeBySelectedLine(state, (line, changes) => {
    let space = /^\s*/.exec(line.text)[0];
    if (!space) return;
    let col = countColumn(space, state.tabSize), keep = 0;
    let insert = indentString(state, Math.max(0, col - getIndentUnit(state)));
    while (keep < space.length && keep < insert.length && space.charCodeAt(keep) == insert.charCodeAt(keep)) keep++;
    changes.push({
      from: line.from + keep,
      to: line.from + space.length,
      insert: insert.slice(keep)
    });
  }), {
    userEvent: "delete.dedent"
  }));
  return true;
};
var toggleTabFocusMode = (view) => {
  view.setTabFocusMode();
  return true;
};
var emacsStyleKeymap = [{
  key: "Ctrl-b",
  run: cursorCharLeft,
  shift: selectCharLeft,
  preventDefault: true
}, {
  key: "Ctrl-f",
  run: cursorCharRight,
  shift: selectCharRight
}, {
  key: "Ctrl-p",
  run: cursorLineUp,
  shift: selectLineUp
}, {
  key: "Ctrl-n",
  run: cursorLineDown,
  shift: selectLineDown
}, {
  key: "Ctrl-a",
  run: cursorLineStart,
  shift: selectLineStart
}, {
  key: "Ctrl-e",
  run: cursorLineEnd,
  shift: selectLineEnd
}, {
  key: "Ctrl-d",
  run: deleteCharForward
}, {
  key: "Ctrl-h",
  run: deleteCharBackward
}, {
  key: "Ctrl-k",
  run: deleteToLineEnd
}, {
  key: "Ctrl-Alt-h",
  run: deleteGroupBackward
}, {
  key: "Ctrl-o",
  run: splitLine
}, {
  key: "Ctrl-t",
  run: transposeChars
}, {
  key: "Ctrl-v",
  run: cursorPageDown
}];
var standardKeymap = [{
  key: "ArrowLeft",
  run: cursorCharLeft,
  shift: selectCharLeft,
  preventDefault: true
}, {
  key: "Mod-ArrowLeft",
  mac: "Alt-ArrowLeft",
  run: cursorGroupLeft,
  shift: selectGroupLeft,
  preventDefault: true
}, {
  mac: "Cmd-ArrowLeft",
  run: cursorLineBoundaryLeft,
  shift: selectLineBoundaryLeft,
  preventDefault: true
}, {
  key: "ArrowRight",
  run: cursorCharRight,
  shift: selectCharRight,
  preventDefault: true
}, {
  key: "Mod-ArrowRight",
  mac: "Alt-ArrowRight",
  run: cursorGroupRight,
  shift: selectGroupRight,
  preventDefault: true
}, {
  mac: "Cmd-ArrowRight",
  run: cursorLineBoundaryRight,
  shift: selectLineBoundaryRight,
  preventDefault: true
}, {
  key: "ArrowUp",
  run: cursorLineUp,
  shift: selectLineUp,
  preventDefault: true
}, {
  mac: "Cmd-ArrowUp",
  run: cursorDocStart,
  shift: selectDocStart
}, {
  mac: "Ctrl-ArrowUp",
  run: cursorPageUp,
  shift: selectPageUp
}, {
  key: "ArrowDown",
  run: cursorLineDown,
  shift: selectLineDown,
  preventDefault: true
}, {
  mac: "Cmd-ArrowDown",
  run: cursorDocEnd,
  shift: selectDocEnd
}, {
  mac: "Ctrl-ArrowDown",
  run: cursorPageDown,
  shift: selectPageDown
}, {
  key: "PageUp",
  run: cursorPageUp,
  shift: selectPageUp
}, {
  key: "PageDown",
  run: cursorPageDown,
  shift: selectPageDown
}, {
  key: "Home",
  run: cursorLineBoundaryBackward,
  shift: selectLineBoundaryBackward,
  preventDefault: true
}, {
  key: "Mod-Home",
  run: cursorDocStart,
  shift: selectDocStart
}, {
  key: "End",
  run: cursorLineBoundaryForward,
  shift: selectLineBoundaryForward,
  preventDefault: true
}, {
  key: "Mod-End",
  run: cursorDocEnd,
  shift: selectDocEnd
}, {
  key: "Enter",
  run: insertNewlineAndIndent,
  shift: insertNewlineAndIndent
}, {
  key: "Mod-a",
  run: selectAll
}, {
  key: "Backspace",
  run: deleteCharBackward,
  shift: deleteCharBackward
}, {
  key: "Delete",
  run: deleteCharForward
}, {
  key: "Mod-Backspace",
  mac: "Alt-Backspace",
  run: deleteGroupBackward
}, {
  key: "Mod-Delete",
  mac: "Alt-Delete",
  run: deleteGroupForward
}, {
  mac: "Mod-Backspace",
  run: deleteLineBoundaryBackward
}, {
  mac: "Mod-Delete",
  run: deleteLineBoundaryForward
}].concat(emacsStyleKeymap.map((b) => ({
  mac: b.key,
  run: b.run,
  shift: b.shift
})));
var defaultKeymap = [{
  key: "Alt-ArrowLeft",
  mac: "Ctrl-ArrowLeft",
  run: cursorSyntaxLeft,
  shift: selectSyntaxLeft
}, {
  key: "Alt-ArrowRight",
  mac: "Ctrl-ArrowRight",
  run: cursorSyntaxRight,
  shift: selectSyntaxRight
}, {
  key: "Alt-ArrowUp",
  run: moveLineUp
}, {
  key: "Shift-Alt-ArrowUp",
  run: copyLineUp
}, {
  key: "Alt-ArrowDown",
  run: moveLineDown
}, {
  key: "Shift-Alt-ArrowDown",
  run: copyLineDown
}, {
  key: "Escape",
  run: simplifySelection
}, {
  key: "Mod-Enter",
  run: insertBlankLine
}, {
  key: "Alt-l",
  mac: "Ctrl-l",
  run: selectLine
}, {
  key: "Mod-i",
  run: selectParentSyntax,
  preventDefault: true
}, {
  key: "Mod-[",
  run: indentLess
}, {
  key: "Mod-]",
  run: indentMore
}, {
  key: "Mod-Alt-\\",
  run: indentSelection
}, {
  key: "Shift-Mod-k",
  run: deleteLine
}, {
  key: "Shift-Mod-\\",
  run: cursorMatchingBracket
}, {
  key: "Mod-/",
  run: toggleComment
}, {
  key: "Alt-A",
  run: toggleBlockComment
}, {
  key: "Ctrl-m",
  mac: "Shift-Alt-m",
  run: toggleTabFocusMode
}].concat(standardKeymap);
var indentWithTab = {
  key: "Tab",
  run: indentMore,
  shift: indentLess
};

// node_modules/@codemirror/theme-one-dark/dist/index.js
var chalky = "#e5c07b";
var coral = "#e06c75";
var cyan = "#56b6c2";
var invalid = "#ffffff";
var ivory = "#abb2bf";
var stone = "#7d8799";
var malibu = "#61afef";
var sage = "#98c379";
var whiskey = "#d19a66";
var violet = "#c678dd";
var darkBackground = "#21252b";
var highlightBackground = "#2c313a";
var background = "#282c34";
var tooltipBackground = "#353a42";
var selection = "#3E4451";
var cursor = "#528bff";
var oneDarkTheme = EditorView.theme({
  "&": {
    color: ivory,
    backgroundColor: background
  },
  ".cm-content": {
    caretColor: cursor
  },
  ".cm-cursor, .cm-dropCursor": {
    borderLeftColor: cursor
  },
  "&.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection": {
    backgroundColor: selection
  },
  ".cm-panels": {
    backgroundColor: darkBackground,
    color: ivory
  },
  ".cm-panels.cm-panels-top": {
    borderBottom: "2px solid black"
  },
  ".cm-panels.cm-panels-bottom": {
    borderTop: "2px solid black"
  },
  ".cm-searchMatch": {
    backgroundColor: "#72a1ff59",
    outline: "1px solid #457dff"
  },
  ".cm-searchMatch.cm-searchMatch-selected": {
    backgroundColor: "#6199ff2f"
  },
  ".cm-activeLine": {
    backgroundColor: "#6699ff0b"
  },
  ".cm-selectionMatch": {
    backgroundColor: "#aafe661a"
  },
  "&.cm-focused .cm-matchingBracket, &.cm-focused .cm-nonmatchingBracket": {
    backgroundColor: "#bad0f847"
  },
  ".cm-gutters": {
    backgroundColor: background,
    color: stone,
    border: "none"
  },
  ".cm-activeLineGutter": {
    backgroundColor: highlightBackground
  },
  ".cm-foldPlaceholder": {
    backgroundColor: "transparent",
    border: "none",
    color: "#ddd"
  },
  ".cm-tooltip": {
    border: "none",
    backgroundColor: tooltipBackground
  },
  ".cm-tooltip .cm-tooltip-arrow:before": {
    borderTopColor: "transparent",
    borderBottomColor: "transparent"
  },
  ".cm-tooltip .cm-tooltip-arrow:after": {
    borderTopColor: tooltipBackground,
    borderBottomColor: tooltipBackground
  },
  ".cm-tooltip-autocomplete": {
    "& > ul > li[aria-selected]": {
      backgroundColor: highlightBackground,
      color: ivory
    }
  }
}, {
  dark: true
});
var oneDarkHighlightStyle = HighlightStyle.define([{
  tag: tags.keyword,
  color: violet
}, {
  tag: [tags.name, tags.deleted, tags.character, tags.propertyName, tags.macroName],
  color: coral
}, {
  tag: [tags.function(tags.variableName), tags.labelName],
  color: malibu
}, {
  tag: [tags.color, tags.constant(tags.name), tags.standard(tags.name)],
  color: whiskey
}, {
  tag: [tags.definition(tags.name), tags.separator],
  color: ivory
}, {
  tag: [tags.typeName, tags.className, tags.number, tags.changed, tags.annotation, tags.modifier, tags.self, tags.namespace],
  color: chalky
}, {
  tag: [tags.operator, tags.operatorKeyword, tags.url, tags.escape, tags.regexp, tags.link, tags.special(tags.string)],
  color: cyan
}, {
  tag: [tags.meta, tags.comment],
  color: stone
}, {
  tag: tags.strong,
  fontWeight: "bold"
}, {
  tag: tags.emphasis,
  fontStyle: "italic"
}, {
  tag: tags.strikethrough,
  textDecoration: "line-through"
}, {
  tag: tags.link,
  color: stone,
  textDecoration: "underline"
}, {
  tag: tags.heading,
  fontWeight: "bold",
  color: coral
}, {
  tag: [tags.atom, tags.bool, tags.special(tags.variableName)],
  color: whiskey
}, {
  tag: [tags.processingInstruction, tags.string, tags.inserted],
  color: sage
}, {
  tag: tags.invalid,
  color: invalid
}]);
var oneDark = [oneDarkTheme, syntaxHighlighting(oneDarkHighlightStyle)];

// node_modules/crelt/index.js
function crelt() {
  var elt = arguments[0];
  if (typeof elt == "string") elt = document.createElement(elt);
  var i = 1, next = arguments[1];
  if (next && typeof next == "object" && next.nodeType == null && !Array.isArray(next)) {
    for (var name in next) if (Object.prototype.hasOwnProperty.call(next, name)) {
      var value = next[name];
      if (typeof value == "string") elt.setAttribute(name, value);
      else if (value != null) elt[name] = value;
    }
    i++;
  }
  for (; i < arguments.length; i++) add(elt, arguments[i]);
  return elt;
}
function add(elt, child) {
  if (typeof child == "string") {
    elt.appendChild(document.createTextNode(child));
  } else if (child == null) {
  } else if (child.nodeType != null) {
    elt.appendChild(child);
  } else if (Array.isArray(child)) {
    for (var i = 0; i < child.length; i++) add(elt, child[i]);
  } else {
    throw new RangeError("Unsupported child node: " + child);
  }
}

// node_modules/@codemirror/search/dist/index.js
var basicNormalize = typeof String.prototype.normalize == "function" ? (x) => x.normalize("NFKD") : (x) => x;
var SearchCursor = class {
  /**
  Create a text cursor. The query is the search string, `from` to
  `to` provides the region to search.
  
  When `normalize` is given, it will be called, on both the query
  string and the content it is matched against, before comparing.
  You can, for example, create a case-insensitive search by
  passing `s => s.toLowerCase()`.
  
  Text is always normalized with
  [`.normalize("NFKD")`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/normalize)
  (when supported).
  */
  constructor(text, query, from = 0, to = text.length, normalize2, test) {
    this.test = test;
    this.value = {
      from: 0,
      to: 0
    };
    this.done = false;
    this.matches = [];
    this.buffer = "";
    this.bufferPos = 0;
    this.iter = text.iterRange(from, to);
    this.bufferStart = from;
    this.normalize = normalize2 ? (x) => normalize2(basicNormalize(x)) : basicNormalize;
    this.query = this.normalize(query);
  }
  peek() {
    if (this.bufferPos == this.buffer.length) {
      this.bufferStart += this.buffer.length;
      this.iter.next();
      if (this.iter.done) return -1;
      this.bufferPos = 0;
      this.buffer = this.iter.value;
    }
    return codePointAt(this.buffer, this.bufferPos);
  }
  /**
  Look for the next match. Updates the iterator's
  [`value`](https://codemirror.net/6/docs/ref/#search.SearchCursor.value) and
  [`done`](https://codemirror.net/6/docs/ref/#search.SearchCursor.done) properties. Should be called
  at least once before using the cursor.
  */
  next() {
    while (this.matches.length) this.matches.pop();
    return this.nextOverlapping();
  }
  /**
  The `next` method will ignore matches that partially overlap a
  previous match. This method behaves like `next`, but includes
  such matches.
  */
  nextOverlapping() {
    for (; ; ) {
      let next = this.peek();
      if (next < 0) {
        this.done = true;
        return this;
      }
      let str = fromCodePoint(next), start = this.bufferStart + this.bufferPos;
      this.bufferPos += codePointSize(next);
      let norm = this.normalize(str);
      if (norm.length) for (let i = 0, pos = start; ; i++) {
        let code = norm.charCodeAt(i);
        let match = this.match(code, pos, this.bufferPos + this.bufferStart);
        if (i == norm.length - 1) {
          if (match) {
            this.value = match;
            return this;
          }
          break;
        }
        if (pos == start && i < str.length && str.charCodeAt(i) == code) pos++;
      }
    }
  }
  match(code, pos, end) {
    let match = null;
    for (let i = 0; i < this.matches.length; i += 2) {
      let index = this.matches[i], keep = false;
      if (this.query.charCodeAt(index) == code) {
        if (index == this.query.length - 1) {
          match = {
            from: this.matches[i + 1],
            to: end
          };
        } else {
          this.matches[i]++;
          keep = true;
        }
      }
      if (!keep) {
        this.matches.splice(i, 2);
        i -= 2;
      }
    }
    if (this.query.charCodeAt(0) == code) {
      if (this.query.length == 1) match = {
        from: pos,
        to: end
      };
      else this.matches.push(1, pos);
    }
    if (match && this.test && !this.test(match.from, match.to, this.buffer, this.bufferStart)) match = null;
    return match;
  }
};
if (typeof Symbol != "undefined") SearchCursor.prototype[Symbol.iterator] = function() {
  return this;
};
var empty = {
  from: -1,
  to: -1,
  match: /.*/.exec("")
};
var baseFlags = "gm" + (/x/.unicode == null ? "" : "u");
var RegExpCursor = class {
  /**
  Create a cursor that will search the given range in the given
  document. `query` should be the raw pattern (as you'd pass it to
  `new RegExp`).
  */
  constructor(text, query, options, from = 0, to = text.length) {
    this.text = text;
    this.to = to;
    this.curLine = "";
    this.done = false;
    this.value = empty;
    if (/\\[sWDnr]|\n|\r|\[\^/.test(query)) return new MultilineRegExpCursor(text, query, options, from, to);
    this.re = new RegExp(query, baseFlags + ((options === null || options === void 0 ? void 0 : options.ignoreCase) ? "i" : ""));
    this.test = options === null || options === void 0 ? void 0 : options.test;
    this.iter = text.iter();
    let startLine = text.lineAt(from);
    this.curLineStart = startLine.from;
    this.matchPos = toCharEnd(text, from);
    this.getLine(this.curLineStart);
  }
  getLine(skip) {
    this.iter.next(skip);
    if (this.iter.lineBreak) {
      this.curLine = "";
    } else {
      this.curLine = this.iter.value;
      if (this.curLineStart + this.curLine.length > this.to) this.curLine = this.curLine.slice(0, this.to - this.curLineStart);
      this.iter.next();
    }
  }
  nextLine() {
    this.curLineStart = this.curLineStart + this.curLine.length + 1;
    if (this.curLineStart > this.to) this.curLine = "";
    else this.getLine(0);
  }
  /**
  Move to the next match, if there is one.
  */
  next() {
    for (let off = this.matchPos - this.curLineStart; ; ) {
      this.re.lastIndex = off;
      let match = this.matchPos <= this.to && this.re.exec(this.curLine);
      if (match) {
        let from = this.curLineStart + match.index, to = from + match[0].length;
        this.matchPos = toCharEnd(this.text, to + (from == to ? 1 : 0));
        if (from == this.curLineStart + this.curLine.length) this.nextLine();
        if ((from < to || from > this.value.to) && (!this.test || this.test(from, to, match))) {
          this.value = {
            from,
            to,
            match
          };
          return this;
        }
        off = this.matchPos - this.curLineStart;
      } else if (this.curLineStart + this.curLine.length < this.to) {
        this.nextLine();
        off = 0;
      } else {
        this.done = true;
        return this;
      }
    }
  }
};
var flattened = /* @__PURE__ */ new WeakMap();
var FlattenedDoc = class _FlattenedDoc {
  constructor(from, text) {
    this.from = from;
    this.text = text;
  }
  get to() {
    return this.from + this.text.length;
  }
  static get(doc, from, to) {
    let cached = flattened.get(doc);
    if (!cached || cached.from >= to || cached.to <= from) {
      let flat = new _FlattenedDoc(from, doc.sliceString(from, to));
      flattened.set(doc, flat);
      return flat;
    }
    if (cached.from == from && cached.to == to) return cached;
    let {
      text,
      from: cachedFrom
    } = cached;
    if (cachedFrom > from) {
      text = doc.sliceString(from, cachedFrom) + text;
      cachedFrom = from;
    }
    if (cached.to < to) text += doc.sliceString(cached.to, to);
    flattened.set(doc, new _FlattenedDoc(cachedFrom, text));
    return new _FlattenedDoc(from, text.slice(from - cachedFrom, to - cachedFrom));
  }
};
var MultilineRegExpCursor = class {
  constructor(text, query, options, from, to) {
    this.text = text;
    this.to = to;
    this.done = false;
    this.value = empty;
    this.matchPos = toCharEnd(text, from);
    this.re = new RegExp(query, baseFlags + ((options === null || options === void 0 ? void 0 : options.ignoreCase) ? "i" : ""));
    this.test = options === null || options === void 0 ? void 0 : options.test;
    this.flat = FlattenedDoc.get(text, from, this.chunkEnd(
      from + 5e3
      /* Chunk.Base */
    ));
  }
  chunkEnd(pos) {
    return pos >= this.to ? this.to : this.text.lineAt(pos).to;
  }
  next() {
    for (; ; ) {
      let off = this.re.lastIndex = this.matchPos - this.flat.from;
      let match = this.re.exec(this.flat.text);
      if (match && !match[0] && match.index == off) {
        this.re.lastIndex = off + 1;
        match = this.re.exec(this.flat.text);
      }
      if (match) {
        let from = this.flat.from + match.index, to = from + match[0].length;
        if ((this.flat.to >= this.to || match.index + match[0].length <= this.flat.text.length - 10) && (!this.test || this.test(from, to, match))) {
          this.value = {
            from,
            to,
            match
          };
          this.matchPos = toCharEnd(this.text, to + (from == to ? 1 : 0));
          return this;
        }
      }
      if (this.flat.to == this.to) {
        this.done = true;
        return this;
      }
      this.flat = FlattenedDoc.get(this.text, this.flat.from, this.chunkEnd(this.flat.from + this.flat.text.length * 2));
    }
  }
};
if (typeof Symbol != "undefined") {
  RegExpCursor.prototype[Symbol.iterator] = MultilineRegExpCursor.prototype[Symbol.iterator] = function() {
    return this;
  };
}
function validRegExp(source) {
  try {
    new RegExp(source, baseFlags);
    return true;
  } catch (_a) {
    return false;
  }
}
function toCharEnd(text, pos) {
  if (pos >= text.length) return pos;
  let line = text.lineAt(pos), next;
  while (pos < line.to && (next = line.text.charCodeAt(pos - line.from)) >= 56320 && next < 57344) pos++;
  return pos;
}
function createLineDialog(view) {
  let line = String(view.state.doc.lineAt(view.state.selection.main.head).number);
  let input = crelt("input", {
    class: "cm-textfield",
    name: "line",
    value: line
  });
  let dom = crelt("form", {
    class: "cm-gotoLine",
    onkeydown: (event) => {
      if (event.keyCode == 27) {
        event.preventDefault();
        view.dispatch({
          effects: dialogEffect.of(false)
        });
        view.focus();
      } else if (event.keyCode == 13) {
        event.preventDefault();
        go();
      }
    },
    onsubmit: (event) => {
      event.preventDefault();
      go();
    }
  }, crelt("label", view.state.phrase("Go to line"), ": ", input), " ", crelt("button", {
    class: "cm-button",
    type: "submit"
  }, view.state.phrase("go")), crelt("button", {
    name: "close",
    onclick: () => {
      view.dispatch({
        effects: dialogEffect.of(false)
      });
      view.focus();
    },
    "aria-label": view.state.phrase("close"),
    type: "button"
  }, ["×"]));
  function go() {
    let match = /^([+-])?(\d+)?(:\d+)?(%)?$/.exec(input.value);
    if (!match) return;
    let {
      state
    } = view, startLine = state.doc.lineAt(state.selection.main.head);
    let [, sign, ln, cl, percent] = match;
    let col = cl ? +cl.slice(1) : 0;
    let line2 = ln ? +ln : startLine.number;
    if (ln && percent) {
      let pc = line2 / 100;
      if (sign) pc = pc * (sign == "-" ? -1 : 1) + startLine.number / state.doc.lines;
      line2 = Math.round(state.doc.lines * pc);
    } else if (ln && sign) {
      line2 = line2 * (sign == "-" ? -1 : 1) + startLine.number;
    }
    let docLine = state.doc.line(Math.max(1, Math.min(state.doc.lines, line2)));
    let selection2 = EditorSelection.cursor(docLine.from + Math.max(0, Math.min(col, docLine.length)));
    view.dispatch({
      effects: [dialogEffect.of(false), EditorView.scrollIntoView(selection2.from, {
        y: "center"
      })],
      selection: selection2
    });
    view.focus();
  }
  return {
    dom
  };
}
var dialogEffect = StateEffect.define();
var dialogField = StateField.define({
  create() {
    return true;
  },
  update(value, tr) {
    for (let e of tr.effects) if (e.is(dialogEffect)) value = e.value;
    return value;
  },
  provide: (f) => showPanel.from(f, (val) => val ? createLineDialog : null)
});
var gotoLine = (view) => {
  let panel = getPanel(view, createLineDialog);
  if (!panel) {
    let effects = [dialogEffect.of(true)];
    if (view.state.field(dialogField, false) == null) effects.push(StateEffect.appendConfig.of([dialogField, baseTheme$1]));
    view.dispatch({
      effects
    });
    panel = getPanel(view, createLineDialog);
  }
  if (panel) panel.dom.querySelector("input").select();
  return true;
};
var baseTheme$1 = EditorView.baseTheme({
  ".cm-panel.cm-gotoLine": {
    padding: "2px 6px 4px",
    position: "relative",
    "& label": {
      fontSize: "80%"
    },
    "& [name=close]": {
      position: "absolute",
      top: "0",
      bottom: "0",
      right: "4px",
      backgroundColor: "inherit",
      border: "none",
      font: "inherit",
      padding: "0"
    }
  }
});
var defaultHighlightOptions = {
  highlightWordAroundCursor: false,
  minSelectionLength: 1,
  maxMatches: 100,
  wholeWords: false
};
var highlightConfig = Facet.define({
  combine(options) {
    return combineConfig(options, defaultHighlightOptions, {
      highlightWordAroundCursor: (a, b) => a || b,
      minSelectionLength: Math.min,
      maxMatches: Math.min
    });
  }
});
function highlightSelectionMatches(options) {
  let ext = [defaultTheme, matchHighlighter];
  if (options) ext.push(highlightConfig.of(options));
  return ext;
}
var matchDeco = Decoration.mark({
  class: "cm-selectionMatch"
});
var mainMatchDeco = Decoration.mark({
  class: "cm-selectionMatch cm-selectionMatch-main"
});
function insideWordBoundaries(check, state, from, to) {
  return (from == 0 || check(state.sliceDoc(from - 1, from)) != CharCategory.Word) && (to == state.doc.length || check(state.sliceDoc(to, to + 1)) != CharCategory.Word);
}
function insideWord(check, state, from, to) {
  return check(state.sliceDoc(from, from + 1)) == CharCategory.Word && check(state.sliceDoc(to - 1, to)) == CharCategory.Word;
}
var matchHighlighter = ViewPlugin.fromClass(class {
  constructor(view) {
    this.decorations = this.getDeco(view);
  }
  update(update) {
    if (update.selectionSet || update.docChanged || update.viewportChanged) this.decorations = this.getDeco(update.view);
  }
  getDeco(view) {
    let conf = view.state.facet(highlightConfig);
    let {
      state
    } = view, sel = state.selection;
    if (sel.ranges.length > 1) return Decoration.none;
    let range = sel.main, query, check = null;
    if (range.empty) {
      if (!conf.highlightWordAroundCursor) return Decoration.none;
      let word = state.wordAt(range.head);
      if (!word) return Decoration.none;
      check = state.charCategorizer(range.head);
      query = state.sliceDoc(word.from, word.to);
    } else {
      let len = range.to - range.from;
      if (len < conf.minSelectionLength || len > 200) return Decoration.none;
      if (conf.wholeWords) {
        query = state.sliceDoc(range.from, range.to);
        check = state.charCategorizer(range.head);
        if (!(insideWordBoundaries(check, state, range.from, range.to) && insideWord(check, state, range.from, range.to))) return Decoration.none;
      } else {
        query = state.sliceDoc(range.from, range.to);
        if (!query) return Decoration.none;
      }
    }
    let deco = [];
    for (let part of view.visibleRanges) {
      let cursor2 = new SearchCursor(state.doc, query, part.from, part.to);
      while (!cursor2.next().done) {
        let {
          from,
          to
        } = cursor2.value;
        if (!check || insideWordBoundaries(check, state, from, to)) {
          if (range.empty && from <= range.from && to >= range.to) deco.push(mainMatchDeco.range(from, to));
          else if (from >= range.to || to <= range.from) deco.push(matchDeco.range(from, to));
          if (deco.length > conf.maxMatches) return Decoration.none;
        }
      }
    }
    return Decoration.set(deco);
  }
}, {
  decorations: (v) => v.decorations
});
var defaultTheme = EditorView.baseTheme({
  ".cm-selectionMatch": {
    backgroundColor: "#99ff7780"
  },
  ".cm-searchMatch .cm-selectionMatch": {
    backgroundColor: "transparent"
  }
});
var selectWord = ({
  state,
  dispatch
}) => {
  let {
    selection: selection2
  } = state;
  let newSel = EditorSelection.create(selection2.ranges.map((range) => state.wordAt(range.head) || EditorSelection.cursor(range.head)), selection2.mainIndex);
  if (newSel.eq(selection2)) return false;
  dispatch(state.update({
    selection: newSel
  }));
  return true;
};
function findNextOccurrence(state, query) {
  let {
    main,
    ranges
  } = state.selection;
  let word = state.wordAt(main.head), fullWord = word && word.from == main.from && word.to == main.to;
  for (let cycled = false, cursor2 = new SearchCursor(state.doc, query, ranges[ranges.length - 1].to); ; ) {
    cursor2.next();
    if (cursor2.done) {
      if (cycled) return null;
      cursor2 = new SearchCursor(state.doc, query, 0, Math.max(0, ranges[ranges.length - 1].from - 1));
      cycled = true;
    } else {
      if (cycled && ranges.some((r) => r.from == cursor2.value.from)) continue;
      if (fullWord) {
        let word2 = state.wordAt(cursor2.value.from);
        if (!word2 || word2.from != cursor2.value.from || word2.to != cursor2.value.to) continue;
      }
      return cursor2.value;
    }
  }
}
var selectNextOccurrence = ({
  state,
  dispatch
}) => {
  let {
    ranges
  } = state.selection;
  if (ranges.some((sel) => sel.from === sel.to)) return selectWord({
    state,
    dispatch
  });
  let searchedText = state.sliceDoc(ranges[0].from, ranges[0].to);
  if (state.selection.ranges.some((r) => state.sliceDoc(r.from, r.to) != searchedText)) return false;
  let range = findNextOccurrence(state, searchedText);
  if (!range) return false;
  dispatch(state.update({
    selection: state.selection.addRange(EditorSelection.range(range.from, range.to), false),
    effects: EditorView.scrollIntoView(range.to)
  }));
  return true;
};
var searchConfigFacet = Facet.define({
  combine(configs) {
    return combineConfig(configs, {
      top: false,
      caseSensitive: false,
      literal: false,
      regexp: false,
      wholeWord: false,
      createPanel: (view) => new SearchPanel(view),
      scrollToMatch: (range) => EditorView.scrollIntoView(range)
    });
  }
});
var SearchQuery = class {
  /**
  Create a query object.
  */
  constructor(config) {
    this.search = config.search;
    this.caseSensitive = !!config.caseSensitive;
    this.literal = !!config.literal;
    this.regexp = !!config.regexp;
    this.replace = config.replace || "";
    this.valid = !!this.search && (!this.regexp || validRegExp(this.search));
    this.unquoted = this.unquote(this.search);
    this.wholeWord = !!config.wholeWord;
  }
  /**
  @internal
  */
  unquote(text) {
    return this.literal ? text : text.replace(/\\([nrt\\])/g, (_, ch) => ch == "n" ? "\n" : ch == "r" ? "\r" : ch == "t" ? "	" : "\\");
  }
  /**
  Compare this query to another query.
  */
  eq(other) {
    return this.search == other.search && this.replace == other.replace && this.caseSensitive == other.caseSensitive && this.regexp == other.regexp && this.wholeWord == other.wholeWord;
  }
  /**
  @internal
  */
  create() {
    return this.regexp ? new RegExpQuery(this) : new StringQuery(this);
  }
  /**
  Get a search cursor for this query, searching through the given
  range in the given state.
  */
  getCursor(state, from = 0, to) {
    let st = state.doc ? state : EditorState.create({
      doc: state
    });
    if (to == null) to = st.doc.length;
    return this.regexp ? regexpCursor(this, st, from, to) : stringCursor(this, st, from, to);
  }
};
var QueryType = class {
  constructor(spec) {
    this.spec = spec;
  }
};
function stringCursor(spec, state, from, to) {
  return new SearchCursor(state.doc, spec.unquoted, from, to, spec.caseSensitive ? void 0 : (x) => x.toLowerCase(), spec.wholeWord ? stringWordTest(state.doc, state.charCategorizer(state.selection.main.head)) : void 0);
}
function stringWordTest(doc, categorizer) {
  return (from, to, buf, bufPos) => {
    if (bufPos > from || bufPos + buf.length < to) {
      bufPos = Math.max(0, from - 2);
      buf = doc.sliceString(bufPos, Math.min(doc.length, to + 2));
    }
    return (categorizer(charBefore(buf, from - bufPos)) != CharCategory.Word || categorizer(charAfter(buf, from - bufPos)) != CharCategory.Word) && (categorizer(charAfter(buf, to - bufPos)) != CharCategory.Word || categorizer(charBefore(buf, to - bufPos)) != CharCategory.Word);
  };
}
var StringQuery = class extends QueryType {
  constructor(spec) {
    super(spec);
  }
  nextMatch(state, curFrom, curTo) {
    let cursor2 = stringCursor(this.spec, state, curTo, state.doc.length).nextOverlapping();
    if (cursor2.done) {
      let end = Math.min(state.doc.length, curFrom + this.spec.unquoted.length);
      cursor2 = stringCursor(this.spec, state, 0, end).nextOverlapping();
    }
    return cursor2.done || cursor2.value.from == curFrom && cursor2.value.to == curTo ? null : cursor2.value;
  }
  // Searching in reverse is, rather than implementing an inverted search
  // cursor, done by scanning chunk after chunk forward.
  prevMatchInRange(state, from, to) {
    for (let pos = to; ; ) {
      let start = Math.max(from, pos - 1e4 - this.spec.unquoted.length);
      let cursor2 = stringCursor(this.spec, state, start, pos), range = null;
      while (!cursor2.nextOverlapping().done) range = cursor2.value;
      if (range) return range;
      if (start == from) return null;
      pos -= 1e4;
    }
  }
  prevMatch(state, curFrom, curTo) {
    let found = this.prevMatchInRange(state, 0, curFrom);
    if (!found) found = this.prevMatchInRange(state, Math.max(0, curTo - this.spec.unquoted.length), state.doc.length);
    return found && (found.from != curFrom || found.to != curTo) ? found : null;
  }
  getReplacement(_result) {
    return this.spec.unquote(this.spec.replace);
  }
  matchAll(state, limit) {
    let cursor2 = stringCursor(this.spec, state, 0, state.doc.length), ranges = [];
    while (!cursor2.next().done) {
      if (ranges.length >= limit) return null;
      ranges.push(cursor2.value);
    }
    return ranges;
  }
  highlight(state, from, to, add2) {
    let cursor2 = stringCursor(this.spec, state, Math.max(0, from - this.spec.unquoted.length), Math.min(to + this.spec.unquoted.length, state.doc.length));
    while (!cursor2.next().done) add2(cursor2.value.from, cursor2.value.to);
  }
};
function regexpCursor(spec, state, from, to) {
  return new RegExpCursor(state.doc, spec.search, {
    ignoreCase: !spec.caseSensitive,
    test: spec.wholeWord ? regexpWordTest(state.charCategorizer(state.selection.main.head)) : void 0
  }, from, to);
}
function charBefore(str, index) {
  return str.slice(findClusterBreak(str, index, false), index);
}
function charAfter(str, index) {
  return str.slice(index, findClusterBreak(str, index));
}
function regexpWordTest(categorizer) {
  return (_from, _to, match) => !match[0].length || (categorizer(charBefore(match.input, match.index)) != CharCategory.Word || categorizer(charAfter(match.input, match.index)) != CharCategory.Word) && (categorizer(charAfter(match.input, match.index + match[0].length)) != CharCategory.Word || categorizer(charBefore(match.input, match.index + match[0].length)) != CharCategory.Word);
}
var RegExpQuery = class extends QueryType {
  nextMatch(state, curFrom, curTo) {
    let cursor2 = regexpCursor(this.spec, state, curTo, state.doc.length).next();
    if (cursor2.done) cursor2 = regexpCursor(this.spec, state, 0, curFrom).next();
    return cursor2.done ? null : cursor2.value;
  }
  prevMatchInRange(state, from, to) {
    for (let size = 1; ; size++) {
      let start = Math.max(
        from,
        to - size * 1e4
        /* FindPrev.ChunkSize */
      );
      let cursor2 = regexpCursor(this.spec, state, start, to), range = null;
      while (!cursor2.next().done) range = cursor2.value;
      if (range && (start == from || range.from > start + 10)) return range;
      if (start == from) return null;
    }
  }
  prevMatch(state, curFrom, curTo) {
    return this.prevMatchInRange(state, 0, curFrom) || this.prevMatchInRange(state, curTo, state.doc.length);
  }
  getReplacement(result) {
    return this.spec.unquote(this.spec.replace).replace(/\$([$&]|\d+)/g, (m, i) => {
      if (i == "&") return result.match[0];
      if (i == "$") return "$";
      for (let l = i.length; l > 0; l--) {
        let n = +i.slice(0, l);
        if (n > 0 && n < result.match.length) return result.match[n] + i.slice(l);
      }
      return m;
    });
  }
  matchAll(state, limit) {
    let cursor2 = regexpCursor(this.spec, state, 0, state.doc.length), ranges = [];
    while (!cursor2.next().done) {
      if (ranges.length >= limit) return null;
      ranges.push(cursor2.value);
    }
    return ranges;
  }
  highlight(state, from, to, add2) {
    let cursor2 = regexpCursor(this.spec, state, Math.max(
      0,
      from - 250
      /* RegExp.HighlightMargin */
    ), Math.min(to + 250, state.doc.length));
    while (!cursor2.next().done) add2(cursor2.value.from, cursor2.value.to);
  }
};
var setSearchQuery = StateEffect.define();
var togglePanel = StateEffect.define();
var searchState = StateField.define({
  create(state) {
    return new SearchState(defaultQuery(state).create(), null);
  },
  update(value, tr) {
    for (let effect of tr.effects) {
      if (effect.is(setSearchQuery)) value = new SearchState(effect.value.create(), value.panel);
      else if (effect.is(togglePanel)) value = new SearchState(value.query, effect.value ? createSearchPanel : null);
    }
    return value;
  },
  provide: (f) => showPanel.from(f, (val) => val.panel)
});
var SearchState = class {
  constructor(query, panel) {
    this.query = query;
    this.panel = panel;
  }
};
var matchMark = Decoration.mark({
  class: "cm-searchMatch"
});
var selectedMatchMark = Decoration.mark({
  class: "cm-searchMatch cm-searchMatch-selected"
});
var searchHighlighter = ViewPlugin.fromClass(class {
  constructor(view) {
    this.view = view;
    this.decorations = this.highlight(view.state.field(searchState));
  }
  update(update) {
    let state = update.state.field(searchState);
    if (state != update.startState.field(searchState) || update.docChanged || update.selectionSet || update.viewportChanged) this.decorations = this.highlight(state);
  }
  highlight({
    query,
    panel
  }) {
    if (!panel || !query.spec.valid) return Decoration.none;
    let {
      view
    } = this;
    let builder = new RangeSetBuilder();
    for (let i = 0, ranges = view.visibleRanges, l = ranges.length; i < l; i++) {
      let {
        from,
        to
      } = ranges[i];
      while (i < l - 1 && to > ranges[i + 1].from - 2 * 250) to = ranges[++i].to;
      query.highlight(view.state, from, to, (from2, to2) => {
        let selected = view.state.selection.ranges.some((r) => r.from == from2 && r.to == to2);
        builder.add(from2, to2, selected ? selectedMatchMark : matchMark);
      });
    }
    return builder.finish();
  }
}, {
  decorations: (v) => v.decorations
});
function searchCommand(f) {
  return (view) => {
    let state = view.state.field(searchState, false);
    return state && state.query.spec.valid ? f(view, state) : openSearchPanel(view);
  };
}
var findNext = searchCommand((view, {
  query
}) => {
  let {
    to
  } = view.state.selection.main;
  let next = query.nextMatch(view.state, to, to);
  if (!next) return false;
  let selection2 = EditorSelection.single(next.from, next.to);
  let config = view.state.facet(searchConfigFacet);
  view.dispatch({
    selection: selection2,
    effects: [announceMatch(view, next), config.scrollToMatch(selection2.main, view)],
    userEvent: "select.search"
  });
  selectSearchInput(view);
  return true;
});
var findPrevious = searchCommand((view, {
  query
}) => {
  let {
    state
  } = view, {
    from
  } = state.selection.main;
  let prev = query.prevMatch(state, from, from);
  if (!prev) return false;
  let selection2 = EditorSelection.single(prev.from, prev.to);
  let config = view.state.facet(searchConfigFacet);
  view.dispatch({
    selection: selection2,
    effects: [announceMatch(view, prev), config.scrollToMatch(selection2.main, view)],
    userEvent: "select.search"
  });
  selectSearchInput(view);
  return true;
});
var selectMatches = searchCommand((view, {
  query
}) => {
  let ranges = query.matchAll(view.state, 1e3);
  if (!ranges || !ranges.length) return false;
  view.dispatch({
    selection: EditorSelection.create(ranges.map((r) => EditorSelection.range(r.from, r.to))),
    userEvent: "select.search.matches"
  });
  return true;
});
var selectSelectionMatches = ({
  state,
  dispatch
}) => {
  let sel = state.selection;
  if (sel.ranges.length > 1 || sel.main.empty) return false;
  let {
    from,
    to
  } = sel.main;
  let ranges = [], main = 0;
  for (let cur = new SearchCursor(state.doc, state.sliceDoc(from, to)); !cur.next().done; ) {
    if (ranges.length > 1e3) return false;
    if (cur.value.from == from) main = ranges.length;
    ranges.push(EditorSelection.range(cur.value.from, cur.value.to));
  }
  dispatch(state.update({
    selection: EditorSelection.create(ranges, main),
    userEvent: "select.search.matches"
  }));
  return true;
};
var replaceNext = searchCommand((view, {
  query
}) => {
  let {
    state
  } = view, {
    from,
    to
  } = state.selection.main;
  if (state.readOnly) return false;
  let match = query.nextMatch(state, from, from);
  if (!match) return false;
  let next = match;
  let changes = [], selection2, replacement;
  let effects = [];
  if (next.from == from && next.to == to) {
    replacement = state.toText(query.getReplacement(next));
    changes.push({
      from: next.from,
      to: next.to,
      insert: replacement
    });
    next = query.nextMatch(state, next.from, next.to);
    effects.push(EditorView.announce.of(state.phrase("replaced match on line $", state.doc.lineAt(from).number) + "."));
  }
  if (next) {
    let off = changes.length == 0 || changes[0].from >= match.to ? 0 : match.to - match.from - replacement.length;
    selection2 = EditorSelection.single(next.from - off, next.to - off);
    effects.push(announceMatch(view, next));
    effects.push(state.facet(searchConfigFacet).scrollToMatch(selection2.main, view));
  }
  view.dispatch({
    changes,
    selection: selection2,
    effects,
    userEvent: "input.replace"
  });
  return true;
});
var replaceAll = searchCommand((view, {
  query
}) => {
  if (view.state.readOnly) return false;
  let changes = query.matchAll(view.state, 1e9).map((match) => {
    let {
      from,
      to
    } = match;
    return {
      from,
      to,
      insert: query.getReplacement(match)
    };
  });
  if (!changes.length) return false;
  let announceText = view.state.phrase("replaced $ matches", changes.length) + ".";
  view.dispatch({
    changes,
    effects: EditorView.announce.of(announceText),
    userEvent: "input.replace.all"
  });
  return true;
});
function createSearchPanel(view) {
  return view.state.facet(searchConfigFacet).createPanel(view);
}
function defaultQuery(state, fallback) {
  var _a, _b, _c, _d, _e;
  let sel = state.selection.main;
  let selText = sel.empty || sel.to > sel.from + 100 ? "" : state.sliceDoc(sel.from, sel.to);
  if (fallback && !selText) return fallback;
  let config = state.facet(searchConfigFacet);
  return new SearchQuery({
    search: ((_a = fallback === null || fallback === void 0 ? void 0 : fallback.literal) !== null && _a !== void 0 ? _a : config.literal) ? selText : selText.replace(/\n/g, "\\n"),
    caseSensitive: (_b = fallback === null || fallback === void 0 ? void 0 : fallback.caseSensitive) !== null && _b !== void 0 ? _b : config.caseSensitive,
    literal: (_c = fallback === null || fallback === void 0 ? void 0 : fallback.literal) !== null && _c !== void 0 ? _c : config.literal,
    regexp: (_d = fallback === null || fallback === void 0 ? void 0 : fallback.regexp) !== null && _d !== void 0 ? _d : config.regexp,
    wholeWord: (_e = fallback === null || fallback === void 0 ? void 0 : fallback.wholeWord) !== null && _e !== void 0 ? _e : config.wholeWord
  });
}
function getSearchInput(view) {
  let panel = getPanel(view, createSearchPanel);
  return panel && panel.dom.querySelector("[main-field]");
}
function selectSearchInput(view) {
  let input = getSearchInput(view);
  if (input && input == view.root.activeElement) input.select();
}
var openSearchPanel = (view) => {
  let state = view.state.field(searchState, false);
  if (state && state.panel) {
    let searchInput = getSearchInput(view);
    if (searchInput && searchInput != view.root.activeElement) {
      let query = defaultQuery(view.state, state.query.spec);
      if (query.valid) view.dispatch({
        effects: setSearchQuery.of(query)
      });
      searchInput.focus();
      searchInput.select();
    }
  } else {
    view.dispatch({
      effects: [togglePanel.of(true), state ? setSearchQuery.of(defaultQuery(view.state, state.query.spec)) : StateEffect.appendConfig.of(searchExtensions)]
    });
  }
  return true;
};
var closeSearchPanel = (view) => {
  let state = view.state.field(searchState, false);
  if (!state || !state.panel) return false;
  let panel = getPanel(view, createSearchPanel);
  if (panel && panel.dom.contains(view.root.activeElement)) view.focus();
  view.dispatch({
    effects: togglePanel.of(false)
  });
  return true;
};
var searchKeymap = [{
  key: "Mod-f",
  run: openSearchPanel,
  scope: "editor search-panel"
}, {
  key: "F3",
  run: findNext,
  shift: findPrevious,
  scope: "editor search-panel",
  preventDefault: true
}, {
  key: "Mod-g",
  run: findNext,
  shift: findPrevious,
  scope: "editor search-panel",
  preventDefault: true
}, {
  key: "Escape",
  run: closeSearchPanel,
  scope: "editor search-panel"
}, {
  key: "Mod-Shift-l",
  run: selectSelectionMatches
}, {
  key: "Mod-Alt-g",
  run: gotoLine
}, {
  key: "Mod-d",
  run: selectNextOccurrence,
  preventDefault: true
}];
var SearchPanel = class {
  constructor(view) {
    this.view = view;
    let query = this.query = view.state.field(searchState).query.spec;
    this.commit = this.commit.bind(this);
    this.searchField = crelt("input", {
      value: query.search,
      placeholder: phrase(view, "Find"),
      "aria-label": phrase(view, "Find"),
      class: "cm-textfield",
      name: "search",
      form: "",
      "main-field": "true",
      onchange: this.commit,
      onkeyup: this.commit
    });
    this.replaceField = crelt("input", {
      value: query.replace,
      placeholder: phrase(view, "Replace"),
      "aria-label": phrase(view, "Replace"),
      class: "cm-textfield",
      name: "replace",
      form: "",
      onchange: this.commit,
      onkeyup: this.commit
    });
    this.caseField = crelt("input", {
      type: "checkbox",
      name: "case",
      form: "",
      checked: query.caseSensitive,
      onchange: this.commit
    });
    this.reField = crelt("input", {
      type: "checkbox",
      name: "re",
      form: "",
      checked: query.regexp,
      onchange: this.commit
    });
    this.wordField = crelt("input", {
      type: "checkbox",
      name: "word",
      form: "",
      checked: query.wholeWord,
      onchange: this.commit
    });
    function button(name, onclick, content) {
      return crelt("button", {
        class: "cm-button",
        name,
        onclick,
        type: "button"
      }, content);
    }
    this.dom = crelt("div", {
      onkeydown: (e) => this.keydown(e),
      class: "cm-search"
    }, [this.searchField, button("next", () => findNext(view), [phrase(view, "next")]), button("prev", () => findPrevious(view), [phrase(view, "previous")]), button("select", () => selectMatches(view), [phrase(view, "all")]), crelt("label", null, [this.caseField, phrase(view, "match case")]), crelt("label", null, [this.reField, phrase(view, "regexp")]), crelt("label", null, [this.wordField, phrase(view, "by word")]), ...view.state.readOnly ? [] : [crelt("br"), this.replaceField, button("replace", () => replaceNext(view), [phrase(view, "replace")]), button("replaceAll", () => replaceAll(view), [phrase(view, "replace all")])], crelt("button", {
      name: "close",
      onclick: () => closeSearchPanel(view),
      "aria-label": phrase(view, "close"),
      type: "button"
    }, ["×"])]);
  }
  commit() {
    let query = new SearchQuery({
      search: this.searchField.value,
      caseSensitive: this.caseField.checked,
      regexp: this.reField.checked,
      wholeWord: this.wordField.checked,
      replace: this.replaceField.value
    });
    if (!query.eq(this.query)) {
      this.query = query;
      this.view.dispatch({
        effects: setSearchQuery.of(query)
      });
    }
  }
  keydown(e) {
    if (runScopeHandlers(this.view, e, "search-panel")) {
      e.preventDefault();
    } else if (e.keyCode == 13 && e.target == this.searchField) {
      e.preventDefault();
      (e.shiftKey ? findPrevious : findNext)(this.view);
    } else if (e.keyCode == 13 && e.target == this.replaceField) {
      e.preventDefault();
      replaceNext(this.view);
    }
  }
  update(update) {
    for (let tr of update.transactions) for (let effect of tr.effects) {
      if (effect.is(setSearchQuery) && !effect.value.eq(this.query)) this.setQuery(effect.value);
    }
  }
  setQuery(query) {
    this.query = query;
    this.searchField.value = query.search;
    this.replaceField.value = query.replace;
    this.caseField.checked = query.caseSensitive;
    this.reField.checked = query.regexp;
    this.wordField.checked = query.wholeWord;
  }
  mount() {
    this.searchField.select();
  }
  get pos() {
    return 80;
  }
  get top() {
    return this.view.state.facet(searchConfigFacet).top;
  }
};
function phrase(view, phrase2) {
  return view.state.phrase(phrase2);
}
var AnnounceMargin = 30;
var Break = /[\s\.,:;?!]/;
function announceMatch(view, {
  from,
  to
}) {
  let line = view.state.doc.lineAt(from), lineEnd = view.state.doc.lineAt(to).to;
  let start = Math.max(line.from, from - AnnounceMargin), end = Math.min(lineEnd, to + AnnounceMargin);
  let text = view.state.sliceDoc(start, end);
  if (start != line.from) {
    for (let i = 0; i < AnnounceMargin; i++) if (!Break.test(text[i + 1]) && Break.test(text[i])) {
      text = text.slice(i);
      break;
    }
  }
  if (end != lineEnd) {
    for (let i = text.length - 1; i > text.length - AnnounceMargin; i--) if (!Break.test(text[i - 1]) && Break.test(text[i])) {
      text = text.slice(0, i);
      break;
    }
  }
  return EditorView.announce.of(`${view.state.phrase("current match")}. ${text} ${view.state.phrase("on line")} ${line.number}.`);
}
var baseTheme = EditorView.baseTheme({
  ".cm-panel.cm-search": {
    padding: "2px 6px 4px",
    position: "relative",
    "& [name=close]": {
      position: "absolute",
      top: "0",
      right: "4px",
      backgroundColor: "inherit",
      border: "none",
      font: "inherit",
      padding: 0,
      margin: 0
    },
    "& input, & button, & label": {
      margin: ".2em .6em .2em 0"
    },
    "& input[type=checkbox]": {
      marginRight: ".2em"
    },
    "& label": {
      fontSize: "80%",
      whiteSpace: "pre"
    }
  },
  "&light .cm-searchMatch": {
    backgroundColor: "#ffff0054"
  },
  "&dark .cm-searchMatch": {
    backgroundColor: "#00ffff8a"
  },
  "&light .cm-searchMatch-selected": {
    backgroundColor: "#ff6a0054"
  },
  "&dark .cm-searchMatch-selected": {
    backgroundColor: "#ff00ff8a"
  }
});
var searchExtensions = [searchState, Prec.low(searchHighlighter), baseTheme];

// node_modules/@codemirror/lint/dist/index.js
var SelectedDiagnostic = class {
  constructor(from, to, diagnostic) {
    this.from = from;
    this.to = to;
    this.diagnostic = diagnostic;
  }
};
var LintState = class _LintState {
  constructor(diagnostics, panel, selected) {
    this.diagnostics = diagnostics;
    this.panel = panel;
    this.selected = selected;
  }
  static init(diagnostics, panel, state) {
    let diagnosticFilter = state.facet(lintConfig).markerFilter;
    if (diagnosticFilter) diagnostics = diagnosticFilter(diagnostics, state);
    let sorted = diagnostics.slice().sort((a, b) => a.from - b.from || a.to - b.to);
    let deco = new RangeSetBuilder(), active = [], pos = 0;
    for (let i = 0; ; ) {
      let next = i == sorted.length ? null : sorted[i];
      if (!next && !active.length) break;
      let from, to;
      if (active.length) {
        from = pos;
        to = active.reduce((p, d) => Math.min(p, d.to), next && next.from > from ? next.from : 1e8);
      } else {
        from = next.from;
        to = next.to;
        active.push(next);
        i++;
      }
      while (i < sorted.length) {
        let next2 = sorted[i];
        if (next2.from == from && (next2.to > next2.from || next2.to == from)) {
          active.push(next2);
          i++;
          to = Math.min(next2.to, to);
        } else {
          to = Math.min(next2.from, to);
          break;
        }
      }
      let sev = maxSeverity(active);
      if (active.some((d) => d.from == d.to || d.from == d.to - 1 && state.doc.lineAt(d.from).to == d.from)) {
        deco.add(from, from, Decoration.widget({
          widget: new DiagnosticWidget(sev),
          diagnostics: active.slice()
        }));
      } else {
        let markClass = active.reduce((c, d) => d.markClass ? c + " " + d.markClass : c, "");
        deco.add(from, to, Decoration.mark({
          class: "cm-lintRange cm-lintRange-" + sev + markClass,
          diagnostics: active.slice(),
          inclusiveEnd: active.some((a) => a.to > to)
        }));
      }
      pos = to;
      for (let i2 = 0; i2 < active.length; i2++) if (active[i2].to <= pos) active.splice(i2--, 1);
    }
    let set = deco.finish();
    return new _LintState(set, panel, findDiagnostic(set));
  }
};
function findDiagnostic(diagnostics, diagnostic = null, after = 0) {
  let found = null;
  diagnostics.between(after, 1e9, (from, to, {
    spec
  }) => {
    if (diagnostic && spec.diagnostics.indexOf(diagnostic) < 0) return;
    if (!found) found = new SelectedDiagnostic(from, to, diagnostic || spec.diagnostics[0]);
    else if (spec.diagnostics.indexOf(found.diagnostic) < 0) return false;
    else found = new SelectedDiagnostic(found.from, to, found.diagnostic);
  });
  return found;
}
function hideTooltip(tr, tooltip) {
  let from = tooltip.pos, to = tooltip.end || from;
  let result = tr.state.facet(lintConfig).hideOn(tr, from, to);
  if (result != null) return result;
  let line = tr.startState.doc.lineAt(tooltip.pos);
  return !!(tr.effects.some((e) => e.is(setDiagnosticsEffect)) || tr.changes.touchesRange(line.from, Math.max(line.to, to)));
}
function maybeEnableLint(state, effects) {
  return state.field(lintState, false) ? effects : effects.concat(StateEffect.appendConfig.of(lintExtensions));
}
function setDiagnostics(state, diagnostics) {
  return {
    effects: maybeEnableLint(state, [setDiagnosticsEffect.of(diagnostics)])
  };
}
var setDiagnosticsEffect = StateEffect.define();
var togglePanel2 = StateEffect.define();
var movePanelSelection = StateEffect.define();
var lintState = StateField.define({
  create() {
    return new LintState(Decoration.none, null, null);
  },
  update(value, tr) {
    if (tr.docChanged && value.diagnostics.size) {
      let mapped = value.diagnostics.map(tr.changes), selected = null, panel = value.panel;
      if (value.selected) {
        let selPos = tr.changes.mapPos(value.selected.from, 1);
        selected = findDiagnostic(mapped, value.selected.diagnostic, selPos) || findDiagnostic(mapped, null, selPos);
      }
      if (!mapped.size && panel && tr.state.facet(lintConfig).autoPanel) panel = null;
      value = new LintState(mapped, panel, selected);
    }
    for (let effect of tr.effects) {
      if (effect.is(setDiagnosticsEffect)) {
        let panel = !tr.state.facet(lintConfig).autoPanel ? value.panel : effect.value.length ? LintPanel.open : null;
        value = LintState.init(effect.value, panel, tr.state);
      } else if (effect.is(togglePanel2)) {
        value = new LintState(value.diagnostics, effect.value ? LintPanel.open : null, value.selected);
      } else if (effect.is(movePanelSelection)) {
        value = new LintState(value.diagnostics, value.panel, effect.value);
      }
    }
    return value;
  },
  provide: (f) => [showPanel.from(f, (val) => val.panel), EditorView.decorations.from(f, (s) => s.diagnostics)]
});
var activeMark = Decoration.mark({
  class: "cm-lintRange cm-lintRange-active"
});
function lintTooltip(view, pos, side) {
  let {
    diagnostics
  } = view.state.field(lintState);
  let found, start = -1, end = -1;
  diagnostics.between(pos - (side < 0 ? 1 : 0), pos + (side > 0 ? 1 : 0), (from, to, {
    spec
  }) => {
    if (pos >= from && pos <= to && (from == to || (pos > from || side > 0) && (pos < to || side < 0))) {
      found = spec.diagnostics;
      start = from;
      end = to;
      return false;
    }
  });
  let diagnosticFilter = view.state.facet(lintConfig).tooltipFilter;
  if (found && diagnosticFilter) found = diagnosticFilter(found, view.state);
  if (!found) return null;
  return {
    pos: start,
    end,
    above: view.state.doc.lineAt(start).to < end,
    create() {
      return {
        dom: diagnosticsTooltip(view, found)
      };
    }
  };
}
function diagnosticsTooltip(view, diagnostics) {
  return crelt("ul", {
    class: "cm-tooltip-lint"
  }, diagnostics.map((d) => renderDiagnostic(view, d, false)));
}
var openLintPanel = (view) => {
  let field = view.state.field(lintState, false);
  if (!field || !field.panel) view.dispatch({
    effects: maybeEnableLint(view.state, [togglePanel2.of(true)])
  });
  let panel = getPanel(view, LintPanel.open);
  if (panel) panel.dom.querySelector(".cm-panel-lint ul").focus();
  return true;
};
var closeLintPanel = (view) => {
  let field = view.state.field(lintState, false);
  if (!field || !field.panel) return false;
  view.dispatch({
    effects: togglePanel2.of(false)
  });
  return true;
};
var nextDiagnostic = (view) => {
  let field = view.state.field(lintState, false);
  if (!field) return false;
  let sel = view.state.selection.main, next = field.diagnostics.iter(sel.to + 1);
  if (!next.value) {
    next = field.diagnostics.iter(0);
    if (!next.value || next.from == sel.from && next.to == sel.to) return false;
  }
  view.dispatch({
    selection: {
      anchor: next.from,
      head: next.to
    },
    scrollIntoView: true
  });
  return true;
};
var lintKeymap = [{
  key: "Mod-Shift-m",
  run: openLintPanel,
  preventDefault: true
}, {
  key: "F8",
  run: nextDiagnostic
}];
var lintPlugin = ViewPlugin.fromClass(class {
  constructor(view) {
    this.view = view;
    this.timeout = -1;
    this.set = true;
    let {
      delay
    } = view.state.facet(lintConfig);
    this.lintTime = Date.now() + delay;
    this.run = this.run.bind(this);
    this.timeout = setTimeout(this.run, delay);
  }
  run() {
    clearTimeout(this.timeout);
    let now = Date.now();
    if (now < this.lintTime - 10) {
      this.timeout = setTimeout(this.run, this.lintTime - now);
    } else {
      this.set = false;
      let {
        state
      } = this.view, {
        sources
      } = state.facet(lintConfig);
      if (sources.length) batchResults(sources.map((s) => Promise.resolve(s(this.view))), (annotations) => {
        if (this.view.state.doc == state.doc) this.view.dispatch(setDiagnostics(this.view.state, annotations.reduce((a, b) => a.concat(b))));
      }, (error) => {
        logException(this.view.state, error);
      });
    }
  }
  update(update) {
    let config = update.state.facet(lintConfig);
    if (update.docChanged || config != update.startState.facet(lintConfig) || config.needsRefresh && config.needsRefresh(update)) {
      this.lintTime = Date.now() + config.delay;
      if (!this.set) {
        this.set = true;
        this.timeout = setTimeout(this.run, config.delay);
      }
    }
  }
  force() {
    if (this.set) {
      this.lintTime = Date.now();
      this.run();
    }
  }
  destroy() {
    clearTimeout(this.timeout);
  }
});
function batchResults(promises, sink, error) {
  let collected = [], timeout2 = -1;
  for (let p of promises) p.then((value) => {
    collected.push(value);
    clearTimeout(timeout2);
    if (collected.length == promises.length) sink(collected);
    else timeout2 = setTimeout(() => sink(collected), 200);
  }, error);
}
var lintConfig = Facet.define({
  combine(input) {
    return Object.assign({
      sources: input.map((i) => i.source).filter((x) => x != null)
    }, combineConfig(input.map((i) => i.config), {
      delay: 750,
      markerFilter: null,
      tooltipFilter: null,
      needsRefresh: null,
      hideOn: () => null
    }, {
      needsRefresh: (a, b) => !a ? b : !b ? a : (u) => a(u) || b(u)
    }));
  }
});
function assignKeys(actions) {
  let assigned = [];
  if (actions) actions: for (let {
    name
  } of actions) {
    for (let i = 0; i < name.length; i++) {
      let ch = name[i];
      if (/[a-zA-Z]/.test(ch) && !assigned.some((c) => c.toLowerCase() == ch.toLowerCase())) {
        assigned.push(ch);
        continue actions;
      }
    }
    assigned.push("");
  }
  return assigned;
}
function renderDiagnostic(view, diagnostic, inPanel) {
  var _a;
  let keys = inPanel ? assignKeys(diagnostic.actions) : [];
  return crelt("li", {
    class: "cm-diagnostic cm-diagnostic-" + diagnostic.severity
  }, crelt("span", {
    class: "cm-diagnosticText"
  }, diagnostic.renderMessage ? diagnostic.renderMessage(view) : diagnostic.message), (_a = diagnostic.actions) === null || _a === void 0 ? void 0 : _a.map((action, i) => {
    let fired = false, click = (e) => {
      e.preventDefault();
      if (fired) return;
      fired = true;
      let found = findDiagnostic(view.state.field(lintState).diagnostics, diagnostic);
      if (found) action.apply(view, found.from, found.to);
    };
    let {
      name
    } = action, keyIndex = keys[i] ? name.indexOf(keys[i]) : -1;
    let nameElt = keyIndex < 0 ? name : [name.slice(0, keyIndex), crelt("u", name.slice(keyIndex, keyIndex + 1)), name.slice(keyIndex + 1)];
    return crelt("button", {
      type: "button",
      class: "cm-diagnosticAction",
      onclick: click,
      onmousedown: click,
      "aria-label": ` Action: ${name}${keyIndex < 0 ? "" : ` (access key "${keys[i]})"`}.`
    }, nameElt);
  }), diagnostic.source && crelt("div", {
    class: "cm-diagnosticSource"
  }, diagnostic.source));
}
var DiagnosticWidget = class extends WidgetType {
  constructor(sev) {
    super();
    this.sev = sev;
  }
  eq(other) {
    return other.sev == this.sev;
  }
  toDOM() {
    return crelt("span", {
      class: "cm-lintPoint cm-lintPoint-" + this.sev
    });
  }
};
var PanelItem = class {
  constructor(view, diagnostic) {
    this.diagnostic = diagnostic;
    this.id = "item_" + Math.floor(Math.random() * 4294967295).toString(16);
    this.dom = renderDiagnostic(view, diagnostic, true);
    this.dom.id = this.id;
    this.dom.setAttribute("role", "option");
  }
};
var LintPanel = class _LintPanel {
  constructor(view) {
    this.view = view;
    this.items = [];
    let onkeydown = (event) => {
      if (event.keyCode == 27) {
        closeLintPanel(this.view);
        this.view.focus();
      } else if (event.keyCode == 38 || event.keyCode == 33) {
        this.moveSelection((this.selectedIndex - 1 + this.items.length) % this.items.length);
      } else if (event.keyCode == 40 || event.keyCode == 34) {
        this.moveSelection((this.selectedIndex + 1) % this.items.length);
      } else if (event.keyCode == 36) {
        this.moveSelection(0);
      } else if (event.keyCode == 35) {
        this.moveSelection(this.items.length - 1);
      } else if (event.keyCode == 13) {
        this.view.focus();
      } else if (event.keyCode >= 65 && event.keyCode <= 90 && this.selectedIndex >= 0) {
        let {
          diagnostic
        } = this.items[this.selectedIndex], keys = assignKeys(diagnostic.actions);
        for (let i = 0; i < keys.length; i++) if (keys[i].toUpperCase().charCodeAt(0) == event.keyCode) {
          let found = findDiagnostic(this.view.state.field(lintState).diagnostics, diagnostic);
          if (found) diagnostic.actions[i].apply(view, found.from, found.to);
        }
      } else {
        return;
      }
      event.preventDefault();
    };
    let onclick = (event) => {
      for (let i = 0; i < this.items.length; i++) {
        if (this.items[i].dom.contains(event.target)) this.moveSelection(i);
      }
    };
    this.list = crelt("ul", {
      tabIndex: 0,
      role: "listbox",
      "aria-label": this.view.state.phrase("Diagnostics"),
      onkeydown,
      onclick
    });
    this.dom = crelt("div", {
      class: "cm-panel-lint"
    }, this.list, crelt("button", {
      type: "button",
      name: "close",
      "aria-label": this.view.state.phrase("close"),
      onclick: () => closeLintPanel(this.view)
    }, "×"));
    this.update();
  }
  get selectedIndex() {
    let selected = this.view.state.field(lintState).selected;
    if (!selected) return -1;
    for (let i = 0; i < this.items.length; i++) if (this.items[i].diagnostic == selected.diagnostic) return i;
    return -1;
  }
  update() {
    let {
      diagnostics,
      selected
    } = this.view.state.field(lintState);
    let i = 0, needsSync = false, newSelectedItem = null;
    let seen = /* @__PURE__ */ new Set();
    diagnostics.between(0, this.view.state.doc.length, (_start, _end, {
      spec
    }) => {
      for (let diagnostic of spec.diagnostics) {
        if (seen.has(diagnostic)) continue;
        seen.add(diagnostic);
        let found = -1, item;
        for (let j = i; j < this.items.length; j++) if (this.items[j].diagnostic == diagnostic) {
          found = j;
          break;
        }
        if (found < 0) {
          item = new PanelItem(this.view, diagnostic);
          this.items.splice(i, 0, item);
          needsSync = true;
        } else {
          item = this.items[found];
          if (found > i) {
            this.items.splice(i, found - i);
            needsSync = true;
          }
        }
        if (selected && item.diagnostic == selected.diagnostic) {
          if (!item.dom.hasAttribute("aria-selected")) {
            item.dom.setAttribute("aria-selected", "true");
            newSelectedItem = item;
          }
        } else if (item.dom.hasAttribute("aria-selected")) {
          item.dom.removeAttribute("aria-selected");
        }
        i++;
      }
    });
    while (i < this.items.length && !(this.items.length == 1 && this.items[0].diagnostic.from < 0)) {
      needsSync = true;
      this.items.pop();
    }
    if (this.items.length == 0) {
      this.items.push(new PanelItem(this.view, {
        from: -1,
        to: -1,
        severity: "info",
        message: this.view.state.phrase("No diagnostics")
      }));
      needsSync = true;
    }
    if (newSelectedItem) {
      this.list.setAttribute("aria-activedescendant", newSelectedItem.id);
      this.view.requestMeasure({
        key: this,
        read: () => ({
          sel: newSelectedItem.dom.getBoundingClientRect(),
          panel: this.list.getBoundingClientRect()
        }),
        write: ({
          sel,
          panel
        }) => {
          let scaleY = panel.height / this.list.offsetHeight;
          if (sel.top < panel.top) this.list.scrollTop -= (panel.top - sel.top) / scaleY;
          else if (sel.bottom > panel.bottom) this.list.scrollTop += (sel.bottom - panel.bottom) / scaleY;
        }
      });
    } else if (this.selectedIndex < 0) {
      this.list.removeAttribute("aria-activedescendant");
    }
    if (needsSync) this.sync();
  }
  sync() {
    let domPos = this.list.firstChild;
    function rm2() {
      let prev = domPos;
      domPos = prev.nextSibling;
      prev.remove();
    }
    for (let item of this.items) {
      if (item.dom.parentNode == this.list) {
        while (domPos != item.dom) rm2();
        domPos = item.dom.nextSibling;
      } else {
        this.list.insertBefore(item.dom, domPos);
      }
    }
    while (domPos) rm2();
  }
  moveSelection(selectedIndex) {
    if (this.selectedIndex < 0) return;
    let field = this.view.state.field(lintState);
    let selection2 = findDiagnostic(field.diagnostics, this.items[selectedIndex].diagnostic);
    if (!selection2) return;
    this.view.dispatch({
      selection: {
        anchor: selection2.from,
        head: selection2.to
      },
      scrollIntoView: true,
      effects: movePanelSelection.of(selection2)
    });
  }
  static open(view) {
    return new _LintPanel(view);
  }
};
function svg(content, attrs = `viewBox="0 0 40 40"`) {
  return `url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" ${attrs}>${encodeURIComponent(content)}</svg>')`;
}
function underline(color) {
  return svg(`<path d="m0 2.5 l2 -1.5 l1 0 l2 1.5 l1 0" stroke="${color}" fill="none" stroke-width=".7"/>`, `width="6" height="3"`);
}
var baseTheme2 = EditorView.baseTheme({
  ".cm-diagnostic": {
    padding: "3px 6px 3px 8px",
    marginLeft: "-1px",
    display: "block",
    whiteSpace: "pre-wrap"
  },
  ".cm-diagnostic-error": {
    borderLeft: "5px solid #d11"
  },
  ".cm-diagnostic-warning": {
    borderLeft: "5px solid orange"
  },
  ".cm-diagnostic-info": {
    borderLeft: "5px solid #999"
  },
  ".cm-diagnostic-hint": {
    borderLeft: "5px solid #66d"
  },
  ".cm-diagnosticAction": {
    font: "inherit",
    border: "none",
    padding: "2px 4px",
    backgroundColor: "#444",
    color: "white",
    borderRadius: "3px",
    marginLeft: "8px",
    cursor: "pointer"
  },
  ".cm-diagnosticSource": {
    fontSize: "70%",
    opacity: 0.7
  },
  ".cm-lintRange": {
    backgroundPosition: "left bottom",
    backgroundRepeat: "repeat-x",
    paddingBottom: "0.7px"
  },
  ".cm-lintRange-error": {
    backgroundImage: underline("#d11")
  },
  ".cm-lintRange-warning": {
    backgroundImage: underline("orange")
  },
  ".cm-lintRange-info": {
    backgroundImage: underline("#999")
  },
  ".cm-lintRange-hint": {
    backgroundImage: underline("#66d")
  },
  ".cm-lintRange-active": {
    backgroundColor: "#ffdd9980"
  },
  ".cm-tooltip-lint": {
    padding: 0,
    margin: 0
  },
  ".cm-lintPoint": {
    position: "relative",
    "&:after": {
      content: '""',
      position: "absolute",
      bottom: 0,
      left: "-2px",
      borderLeft: "3px solid transparent",
      borderRight: "3px solid transparent",
      borderBottom: "4px solid #d11"
    }
  },
  ".cm-lintPoint-warning": {
    "&:after": {
      borderBottomColor: "orange"
    }
  },
  ".cm-lintPoint-info": {
    "&:after": {
      borderBottomColor: "#999"
    }
  },
  ".cm-lintPoint-hint": {
    "&:after": {
      borderBottomColor: "#66d"
    }
  },
  ".cm-panel.cm-panel-lint": {
    position: "relative",
    "& ul": {
      maxHeight: "100px",
      overflowY: "auto",
      "& [aria-selected]": {
        backgroundColor: "#ddd",
        "& u": {
          textDecoration: "underline"
        }
      },
      "&:focus [aria-selected]": {
        background_fallback: "#bdf",
        backgroundColor: "Highlight",
        color_fallback: "white",
        color: "HighlightText"
      },
      "& u": {
        textDecoration: "none"
      },
      padding: 0,
      margin: 0
    },
    "& [name=close]": {
      position: "absolute",
      top: "0",
      right: "2px",
      background: "inherit",
      border: "none",
      font: "inherit",
      padding: 0,
      margin: 0
    }
  }
});
function severityWeight(sev) {
  return sev == "error" ? 4 : sev == "warning" ? 3 : sev == "info" ? 2 : 1;
}
function maxSeverity(diagnostics) {
  let sev = "hint", weight = 1;
  for (let d of diagnostics) {
    let w = severityWeight(d.severity);
    if (w > weight) {
      weight = w;
      sev = d.severity;
    }
  }
  return sev;
}
var LintGutterMarker = class extends GutterMarker {
  constructor(diagnostics) {
    super();
    this.diagnostics = diagnostics;
    this.severity = maxSeverity(diagnostics);
  }
  toDOM(view) {
    let elt = document.createElement("div");
    elt.className = "cm-lint-marker cm-lint-marker-" + this.severity;
    let diagnostics = this.diagnostics;
    let diagnosticsFilter = view.state.facet(lintGutterConfig).tooltipFilter;
    if (diagnosticsFilter) diagnostics = diagnosticsFilter(diagnostics, view.state);
    if (diagnostics.length) elt.onmouseover = () => gutterMarkerMouseOver(view, elt, diagnostics);
    return elt;
  }
};
function trackHoverOn(view, marker) {
  let mousemove = (event) => {
    let rect = marker.getBoundingClientRect();
    if (event.clientX > rect.left - 10 && event.clientX < rect.right + 10 && event.clientY > rect.top - 10 && event.clientY < rect.bottom + 10) return;
    for (let target = event.target; target; target = target.parentNode) {
      if (target.nodeType == 1 && target.classList.contains("cm-tooltip-lint")) return;
    }
    window.removeEventListener("mousemove", mousemove);
    if (view.state.field(lintGutterTooltip)) view.dispatch({
      effects: setLintGutterTooltip.of(null)
    });
  };
  window.addEventListener("mousemove", mousemove);
}
function gutterMarkerMouseOver(view, marker, diagnostics) {
  function hovered() {
    let line = view.elementAtHeight(marker.getBoundingClientRect().top + 5 - view.documentTop);
    const linePos = view.coordsAtPos(line.from);
    if (linePos) {
      view.dispatch({
        effects: setLintGutterTooltip.of({
          pos: line.from,
          above: false,
          clip: false,
          create() {
            return {
              dom: diagnosticsTooltip(view, diagnostics),
              getCoords: () => marker.getBoundingClientRect()
            };
          }
        })
      });
    }
    marker.onmouseout = marker.onmousemove = null;
    trackHoverOn(view, marker);
  }
  let {
    hoverTime
  } = view.state.facet(lintGutterConfig);
  let hoverTimeout = setTimeout(hovered, hoverTime);
  marker.onmouseout = () => {
    clearTimeout(hoverTimeout);
    marker.onmouseout = marker.onmousemove = null;
  };
  marker.onmousemove = () => {
    clearTimeout(hoverTimeout);
    hoverTimeout = setTimeout(hovered, hoverTime);
  };
}
function markersForDiagnostics(doc, diagnostics) {
  let byLine = /* @__PURE__ */ Object.create(null);
  for (let diagnostic of diagnostics) {
    let line = doc.lineAt(diagnostic.from);
    (byLine[line.from] || (byLine[line.from] = [])).push(diagnostic);
  }
  let markers = [];
  for (let line in byLine) {
    markers.push(new LintGutterMarker(byLine[line]).range(+line));
  }
  return RangeSet.of(markers, true);
}
var lintGutterExtension = gutter({
  class: "cm-gutter-lint",
  markers: (view) => view.state.field(lintGutterMarkers),
  widgetMarker: (view, widget, block) => {
    let diagnostics = [];
    view.state.field(lintGutterMarkers).between(block.from, block.to, (from, to, value) => {
      if (from > block.from && from < block.to) diagnostics.push(...value.diagnostics);
    });
    return diagnostics.length ? new LintGutterMarker(diagnostics) : null;
  }
});
var lintGutterMarkers = StateField.define({
  create() {
    return RangeSet.empty;
  },
  update(markers, tr) {
    markers = markers.map(tr.changes);
    let diagnosticFilter = tr.state.facet(lintGutterConfig).markerFilter;
    for (let effect of tr.effects) {
      if (effect.is(setDiagnosticsEffect)) {
        let diagnostics = effect.value;
        if (diagnosticFilter) diagnostics = diagnosticFilter(diagnostics || [], tr.state);
        markers = markersForDiagnostics(tr.state.doc, diagnostics.slice(0));
      }
    }
    return markers;
  }
});
var setLintGutterTooltip = StateEffect.define();
var lintGutterTooltip = StateField.define({
  create() {
    return null;
  },
  update(tooltip, tr) {
    if (tooltip && tr.docChanged) tooltip = hideTooltip(tr, tooltip) ? null : Object.assign(Object.assign({}, tooltip), {
      pos: tr.changes.mapPos(tooltip.pos)
    });
    return tr.effects.reduce((t, e) => e.is(setLintGutterTooltip) ? e.value : t, tooltip);
  },
  provide: (field) => showTooltip.from(field)
});
var lintGutterTheme = EditorView.baseTheme({
  ".cm-gutter-lint": {
    width: "1.4em",
    "& .cm-gutterElement": {
      padding: ".2em"
    }
  },
  ".cm-lint-marker": {
    width: "1em",
    height: "1em"
  },
  ".cm-lint-marker-info": {
    content: svg(`<path fill="#aaf" stroke="#77e" stroke-width="6" stroke-linejoin="round" d="M5 5L35 5L35 35L5 35Z"/>`)
  },
  ".cm-lint-marker-warning": {
    content: svg(`<path fill="#fe8" stroke="#fd7" stroke-width="6" stroke-linejoin="round" d="M20 6L37 35L3 35Z"/>`)
  },
  ".cm-lint-marker-error": {
    content: svg(`<circle cx="20" cy="20" r="15" fill="#f87" stroke="#f43" stroke-width="6"/>`)
  }
});
var lintExtensions = [lintState, EditorView.decorations.compute([lintState], (state) => {
  let {
    selected,
    panel
  } = state.field(lintState);
  return !selected || !panel || selected.from == selected.to ? Decoration.none : Decoration.set([activeMark.range(selected.from, selected.to)]);
}), hoverTooltip(lintTooltip, {
  hideOn: hideTooltip
}), baseTheme2];
var lintGutterConfig = Facet.define({
  combine(configs) {
    return combineConfig(configs, {
      hoverTime: 300,
      markerFilter: null,
      tooltipFilter: null
    });
  }
});

// node_modules/codemirror/dist/index.js
var basicSetup = (() => [lineNumbers(), highlightActiveLineGutter(), highlightSpecialChars(), history(), foldGutter(), drawSelection(), dropCursor(), EditorState.allowMultipleSelections.of(true), indentOnInput(), syntaxHighlighting(defaultHighlightStyle, {
  fallback: true
}), bracketMatching(), closeBrackets(), autocompletion(), rectangularSelection(), crosshairCursor(), highlightActiveLine(), highlightSelectionMatches(), keymap.of([...closeBracketsKeymap, ...defaultKeymap, ...searchKeymap, ...historyKeymap, ...foldKeymap, ...completionKeymap, ...lintKeymap])])();
var minimalSetup = (() => [highlightSpecialChars(), history(), drawSelection(), syntaxHighlighting(defaultHighlightStyle, {
  fallback: true
}), keymap.of([...defaultKeymap, ...historyKeymap])])();

// node_modules/@codemirror/merge/dist/index.js
var Change = class _Change {
  constructor(fromA, toA, fromB, toB) {
    this.fromA = fromA;
    this.toA = toA;
    this.fromB = fromB;
    this.toB = toB;
  }
  /**
  @internal
  */
  offset(offA, offB = offA) {
    return new _Change(this.fromA + offA, this.toA + offA, this.fromB + offB, this.toB + offB);
  }
};
function findDiff(a, fromA, toA, b, fromB, toB) {
  if (a == b) return [];
  let prefix = commonPrefix(a, fromA, toA, b, fromB, toB);
  let suffix = commonSuffix(a, fromA + prefix, toA, b, fromB + prefix, toB);
  fromA += prefix;
  toA -= suffix;
  fromB += prefix;
  toB -= suffix;
  let lenA = toA - fromA, lenB = toB - fromB;
  if (!lenA || !lenB) return [new Change(fromA, toA, fromB, toB)];
  if (lenA > lenB) {
    let found = a.slice(fromA, toA).indexOf(b.slice(fromB, toB));
    if (found > -1) return [new Change(fromA, fromA + found, fromB, fromB), new Change(fromA + found + lenB, toA, toB, toB)];
  } else if (lenB > lenA) {
    let found = b.slice(fromB, toB).indexOf(a.slice(fromA, toA));
    if (found > -1) return [new Change(fromA, fromA, fromB, fromB + found), new Change(toA, toA, fromB + found + lenA, toB)];
  }
  if (lenA == 1 || lenB == 1) return [new Change(fromA, toA, fromB, toB)];
  let half = halfMatch(a, fromA, toA, b, fromB, toB);
  if (half) {
    let [sharedA, sharedB, sharedLen] = half;
    return findDiff(a, fromA, sharedA, b, fromB, sharedB).concat(findDiff(a, sharedA + sharedLen, toA, b, sharedB + sharedLen, toB));
  }
  return findSnake(a, fromA, toA, b, fromB, toB);
}
var scanLimit = 1e9;
var timeout = 0;
var crude = false;
function findSnake(a, fromA, toA, b, fromB, toB) {
  let lenA = toA - fromA, lenB = toB - fromB;
  if (scanLimit < 1e9 && Math.min(lenA, lenB) > scanLimit * 16 || timeout > 0 && Date.now() > timeout) {
    if (Math.min(lenA, lenB) > scanLimit * 64) return [new Change(fromA, toA, fromB, toB)];
    return crudeMatch(a, fromA, toA, b, fromB, toB);
  }
  let off = Math.ceil((lenA + lenB) / 2);
  frontier1.reset(off);
  frontier2.reset(off);
  let match1 = (x, y) => a.charCodeAt(fromA + x) == b.charCodeAt(fromB + y);
  let match2 = (x, y) => a.charCodeAt(toA - x - 1) == b.charCodeAt(toB - y - 1);
  let test1 = (lenA - lenB) % 2 != 0 ? frontier2 : null, test2 = test1 ? null : frontier1;
  for (let depth2 = 0; depth2 < off; depth2++) {
    if (depth2 > scanLimit || timeout > 0 && !(depth2 & 63) && Date.now() > timeout) return crudeMatch(a, fromA, toA, b, fromB, toB);
    let done = frontier1.advance(depth2, lenA, lenB, off, test1, false, match1) || frontier2.advance(depth2, lenA, lenB, off, test2, true, match2);
    if (done) return bisect(a, fromA, toA, fromA + done[0], b, fromB, toB, fromB + done[1]);
  }
  return [new Change(fromA, toA, fromB, toB)];
}
var Frontier = class {
  constructor() {
    this.vec = [];
  }
  reset(off) {
    this.len = off << 1;
    for (let i = 0; i < this.len; i++) this.vec[i] = -1;
    this.vec[off + 1] = 0;
    this.start = this.end = 0;
  }
  advance(depth2, lenX, lenY, vOff, other, fromBack, match) {
    for (let k = -depth2 + this.start; k <= depth2 - this.end; k += 2) {
      let off = vOff + k;
      let x = k == -depth2 || k != depth2 && this.vec[off - 1] < this.vec[off + 1] ? this.vec[off + 1] : this.vec[off - 1] + 1;
      let y = x - k;
      while (x < lenX && y < lenY && match(x, y)) {
        x++;
        y++;
      }
      this.vec[off] = x;
      if (x > lenX) {
        this.end += 2;
      } else if (y > lenY) {
        this.start += 2;
      } else if (other) {
        let offOther = vOff + (lenX - lenY) - k;
        if (offOther >= 0 && offOther < this.len && other.vec[offOther] != -1) {
          if (!fromBack) {
            let xOther = lenX - other.vec[offOther];
            if (x >= xOther) return [x, y];
          } else {
            let xOther = other.vec[offOther];
            if (xOther >= lenX - x) return [xOther, vOff + xOther - offOther];
          }
        }
      }
    }
    return null;
  }
};
var frontier1 = new Frontier();
var frontier2 = new Frontier();
function bisect(a, fromA, toA, splitA, b, fromB, toB, splitB) {
  let stop = false;
  if (!validIndex(a, splitA) && ++splitA == toA) stop = true;
  if (!validIndex(b, splitB) && ++splitB == toB) stop = true;
  if (stop) return [new Change(fromA, toA, fromB, toB)];
  return findDiff(a, fromA, splitA, b, fromB, splitB).concat(findDiff(a, splitA, toA, b, splitB, toB));
}
function chunkSize(lenA, lenB) {
  let size = 1, max = Math.min(lenA, lenB);
  while (size < max) size = size << 1;
  return size;
}
function commonPrefix(a, fromA, toA, b, fromB, toB) {
  if (fromA == toA || fromA == toB || a.charCodeAt(fromA) != b.charCodeAt(fromB)) return 0;
  let chunk = chunkSize(toA - fromA, toB - fromB);
  for (let pA = fromA, pB = fromB; ; ) {
    let endA = pA + chunk, endB = pB + chunk;
    if (endA > toA || endB > toB || a.slice(pA, endA) != b.slice(pB, endB)) {
      if (chunk == 1) return pA - fromA - (validIndex(a, pA) ? 0 : 1);
      chunk = chunk >> 1;
    } else if (endA == toA || endB == toB) {
      return endA - fromA;
    } else {
      pA = endA;
      pB = endB;
    }
  }
}
function commonSuffix(a, fromA, toA, b, fromB, toB) {
  if (fromA == toA || fromB == toB || a.charCodeAt(toA - 1) != b.charCodeAt(toB - 1)) return 0;
  let chunk = chunkSize(toA - fromA, toB - fromB);
  for (let pA = toA, pB = toB; ; ) {
    let sA = pA - chunk, sB = pB - chunk;
    if (sA < fromA || sB < fromB || a.slice(sA, pA) != b.slice(sB, pB)) {
      if (chunk == 1) return toA - pA - (validIndex(a, pA) ? 0 : 1);
      chunk = chunk >> 1;
    } else if (sA == fromA || sB == fromB) {
      return toA - sA;
    } else {
      pA = sA;
      pB = sB;
    }
  }
}
function findMatch(a, fromA, toA, b, fromB, toB, size, divideTo) {
  let rangeB = b.slice(fromB, toB);
  let best = null;
  for (; ; ) {
    if (best || size < divideTo) return best;
    for (let start = fromA + size; ; ) {
      if (!validIndex(a, start)) start++;
      let end = start + size;
      if (!validIndex(a, end)) end += end == start + 1 ? 1 : -1;
      if (end >= toA) break;
      let seed = a.slice(start, end);
      let found = -1;
      while ((found = rangeB.indexOf(seed, found + 1)) != -1) {
        let prefixAfter = commonPrefix(a, end, toA, b, fromB + found + seed.length, toB);
        let suffixBefore = commonSuffix(a, fromA, start, b, fromB, fromB + found);
        let length = seed.length + prefixAfter + suffixBefore;
        if (!best || best[2] < length) best = [start - suffixBefore, fromB + found - suffixBefore, length];
      }
      start = end;
    }
    if (divideTo < 0) return best;
    size = size >> 1;
  }
}
function halfMatch(a, fromA, toA, b, fromB, toB) {
  let lenA = toA - fromA, lenB = toB - fromB;
  if (lenA < lenB) {
    let result = halfMatch(b, fromB, toB, a, fromA, toA);
    return result && [result[1], result[0], result[2]];
  }
  if (lenA < 4 || lenB * 2 < lenA) return null;
  return findMatch(a, fromA, toA, b, fromB, toB, Math.floor(lenA / 4), -1);
}
function crudeMatch(a, fromA, toA, b, fromB, toB) {
  crude = true;
  let lenA = toA - fromA, lenB = toB - fromB;
  let result;
  if (lenA < lenB) {
    let inv = findMatch(b, fromB, toB, a, fromA, toA, Math.floor(lenA / 6), 50);
    result = inv && [inv[1], inv[0], inv[2]];
  } else {
    result = findMatch(a, fromA, toA, b, fromB, toB, Math.floor(lenB / 6), 50);
  }
  if (!result) return [new Change(fromA, toA, fromB, toB)];
  let [sharedA, sharedB, sharedLen] = result;
  return findDiff(a, fromA, sharedA, b, fromB, sharedB).concat(findDiff(a, sharedA + sharedLen, toA, b, sharedB + sharedLen, toB));
}
function mergeAdjacent(changes, minGap) {
  for (let i = 1; i < changes.length; i++) {
    let prev = changes[i - 1], cur = changes[i];
    if (prev.toA > cur.fromA - minGap && prev.toB > cur.fromB - minGap) {
      changes[i - 1] = new Change(prev.fromA, cur.toA, prev.fromB, cur.toB);
      changes.splice(i--, 1);
    }
  }
}
function normalize(a, b, changes) {
  for (; ; ) {
    mergeAdjacent(changes, 1);
    let moved = false;
    for (let i = 0; i < changes.length; i++) {
      let ch = changes[i], pre, post;
      if (pre = commonPrefix(a, ch.fromA, ch.toA, b, ch.fromB, ch.toB)) ch = changes[i] = new Change(ch.fromA + pre, ch.toA, ch.fromB + pre, ch.toB);
      if (post = commonSuffix(a, ch.fromA, ch.toA, b, ch.fromB, ch.toB)) ch = changes[i] = new Change(ch.fromA, ch.toA - post, ch.fromB, ch.toB - post);
      let lenA = ch.toA - ch.fromA, lenB = ch.toB - ch.fromB;
      if (lenA && lenB) continue;
      let beforeLen = ch.fromA - (i ? changes[i - 1].toA : 0);
      let afterLen = (i < changes.length - 1 ? changes[i + 1].fromA : a.length) - ch.toA;
      if (!beforeLen || !afterLen) continue;
      let text = lenA ? a.slice(ch.fromA, ch.toA) : b.slice(ch.fromB, ch.toB);
      if (beforeLen <= text.length && a.slice(ch.fromA - beforeLen, ch.fromA) == text.slice(text.length - beforeLen)) {
        changes[i] = new Change(ch.fromA - beforeLen, ch.toA - beforeLen, ch.fromB - beforeLen, ch.toB - beforeLen);
        moved = true;
      } else if (afterLen <= text.length && a.slice(ch.toA, ch.toA + afterLen) == text.slice(0, afterLen)) {
        changes[i] = new Change(ch.fromA + afterLen, ch.toA + afterLen, ch.fromB + afterLen, ch.toB + afterLen);
        moved = true;
      }
    }
    if (!moved) break;
  }
  return changes;
}
function makePresentable(changes, a, b) {
  for (let posA = 0, i = 0; i < changes.length; i++) {
    let change = changes[i];
    let lenA = change.toA - change.fromA, lenB = change.toB - change.fromB;
    if (lenA && lenB || lenA > 3 || lenB > 3) {
      let nextChangeA = i == changes.length - 1 ? a.length : changes[i + 1].fromA;
      let maxScanBefore = change.fromA - posA, maxScanAfter = nextChangeA - change.toA;
      let boundBefore = findWordBoundaryBefore(a, change.fromA, Math.min(maxScanBefore, 5));
      let boundAfter = findWordBoundaryAfter(a, change.toA, Math.min(maxScanAfter, 5));
      let lenBefore = change.fromA - boundBefore, lenAfter = boundAfter - change.toA;
      if (!lenA || !lenB) {
        let changeLen = Math.max(lenA, lenB);
        let [changeText, changeFrom, changeTo] = lenA ? [a, change.fromA, change.toA] : [b, change.fromB, change.toB];
        if (lenBefore && lenAfter) {
          if (changeLen > lenBefore && a.slice(boundBefore, change.fromA) == changeText.slice(changeTo - lenBefore, changeTo)) {
            change = changes[i] = new Change(boundBefore, boundBefore + lenA, change.fromB - lenBefore, change.toB - lenBefore);
            boundBefore = change.fromA;
            boundAfter = findWordBoundaryAfter(a, change.toA, Math.min(nextChangeA - change.toA, 5));
          } else if (changeLen > lenAfter && a.slice(change.toA, boundAfter) == changeText.slice(changeFrom, changeFrom + lenAfter)) {
            change = changes[i] = new Change(boundAfter - lenA, boundAfter, change.fromB + lenAfter, change.toB + lenAfter);
            boundAfter = change.toA;
            boundBefore = findWordBoundaryBefore(a, change.fromA, Math.min(change.fromA - posA, 5));
          }
          lenBefore = change.fromA - boundBefore;
          lenAfter = boundAfter - change.toA;
        }
      }
      if (lenBefore || lenAfter) {
        change = changes[i] = new Change(change.fromA - lenBefore, change.toA + lenAfter, change.fromB - lenBefore, change.toB + lenAfter);
      } else if (!lenA) {
        let first = findLineBreakAfter(b, change.fromB, change.toB), len;
        let last = first < 0 ? -1 : findLineBreakBefore(b, change.toB, change.fromB);
        if (first > -1 && (len = first - change.fromB) <= maxScanAfter && b.slice(change.fromB, first) == b.slice(change.toB, change.toB + len)) change = changes[i] = change.offset(len);
        else if (last > -1 && (len = change.toB - last) <= maxScanBefore && b.slice(change.fromB - len, change.fromB) == b.slice(last, change.toB)) change = changes[i] = change.offset(-len);
      } else if (!lenB) {
        let first = findLineBreakAfter(a, change.fromA, change.toA), len;
        let last = first < 0 ? -1 : findLineBreakBefore(a, change.toA, change.fromA);
        if (first > -1 && (len = first - change.fromA) <= maxScanAfter && a.slice(change.fromA, first) == a.slice(change.toA, change.toA + len)) change = changes[i] = change.offset(len);
        else if (last > -1 && (len = change.toA - last) <= maxScanBefore && a.slice(change.fromA - len, change.fromA) == a.slice(last, change.toA)) change = changes[i] = change.offset(-len);
      }
      posA = change.toA;
    }
  }
  mergeAdjacent(changes, 3);
  return changes;
}
var wordChar;
try {
  wordChar = new RegExp("[\\p{Alphabetic}\\p{Number}]", "u");
} catch (_) {
}
function asciiWordChar(code) {
  return code > 48 && code < 58 || code > 64 && code < 91 || code > 96 && code < 123;
}
function wordCharAfter(s, pos) {
  if (pos == s.length) return 0;
  let next = s.charCodeAt(pos);
  if (next < 192) return asciiWordChar(next) ? 1 : 0;
  if (!wordChar) return 0;
  if (!isSurrogate1(next) || pos == s.length - 1) return wordChar.test(String.fromCharCode(next)) ? 1 : 0;
  return wordChar.test(s.slice(pos, pos + 2)) ? 2 : 0;
}
function wordCharBefore(s, pos) {
  if (!pos) return 0;
  let prev = s.charCodeAt(pos - 1);
  if (prev < 192) return asciiWordChar(prev) ? 1 : 0;
  if (!wordChar) return 0;
  if (!isSurrogate2(prev) || pos == 1) return wordChar.test(String.fromCharCode(prev)) ? 1 : 0;
  return wordChar.test(s.slice(pos - 2, pos)) ? 2 : 0;
}
function findWordBoundaryAfter(s, pos, max) {
  if (pos == s.length || !wordCharBefore(s, pos)) return pos;
  for (let cur = pos, end = pos + max; ; ) {
    let size = wordCharAfter(s, cur);
    if (!size) return cur;
    cur += size;
    if (cur > end) return pos;
  }
}
function findWordBoundaryBefore(s, pos, max) {
  if (!pos || !wordCharAfter(s, pos)) return pos;
  for (let cur = pos, end = pos - max; ; ) {
    let size = wordCharBefore(s, cur);
    if (!size) return cur;
    cur -= size;
    if (cur < end) return pos;
  }
}
function findLineBreakBefore(s, pos, stop) {
  for (; pos != stop; pos--) if (s.charCodeAt(pos - 1) == 10) return pos;
  return -1;
}
function findLineBreakAfter(s, pos, stop) {
  for (; pos != stop; pos++) if (s.charCodeAt(pos) == 10) return pos;
  return -1;
}
var isSurrogate1 = (code) => code >= 55296 && code <= 56319;
var isSurrogate2 = (code) => code >= 56320 && code <= 57343;
function validIndex(s, index) {
  return !index || index == s.length || !isSurrogate1(s.charCodeAt(index - 1)) || !isSurrogate2(s.charCodeAt(index));
}
function diff(a, b, config) {
  var _a;
  scanLimit = ((_a = config === null || config === void 0 ? void 0 : config.scanLimit) !== null && _a !== void 0 ? _a : 1e9) >> 1;
  timeout = (config === null || config === void 0 ? void 0 : config.timeout) ? Date.now() + config.timeout : 0;
  crude = false;
  return normalize(a, b, findDiff(a, 0, a.length, b, 0, b.length));
}
function diffIsPrecise() {
  return !crude;
}
function presentableDiff(a, b, config) {
  return makePresentable(diff(a, b, config), a, b);
}
var mergeConfig = Facet.define({
  combine: (values) => values[0]
});
var setChunks = StateEffect.define();
var ChunkField = StateField.define({
  create(state) {
    return null;
  },
  update(current, tr) {
    for (let e of tr.effects) if (e.is(setChunks)) current = e.value;
    return current;
  }
});
var moveByChunk = (dir) => ({
  state,
  dispatch
}) => {
  let chunks = state.field(ChunkField, false), conf = state.facet(mergeConfig);
  if (!chunks || !chunks.length || !conf) return false;
  let {
    head
  } = state.selection.main, pos = 0;
  for (let i = chunks.length - 1; i >= 0; i--) {
    let chunk = chunks[i];
    let [from2, to2] = conf.side == "b" ? [chunk.fromB, chunk.toB] : [chunk.fromA, chunk.toA];
    if (to2 < head) {
      pos = i + 1;
      break;
    }
    if (from2 <= head) {
      if (chunks.length == 1) return false;
      pos = i + (dir < 0 ? 0 : 1);
      break;
    }
  }
  let next = chunks[(pos + (dir < 0 ? chunks.length - 1 : 0)) % chunks.length];
  let [from, to] = conf.side == "b" ? [next.fromB, next.toB] : [next.fromA, next.toA];
  dispatch(state.update({
    selection: {
      anchor: from
    },
    userEvent: "select.byChunk",
    effects: EditorView.scrollIntoView(EditorSelection.range(to, from))
  }));
  return true;
};
var goToNextChunk = moveByChunk(1);
var goToPreviousChunk = moveByChunk(-1);
var Chunk = class _Chunk {
  constructor(changes, fromA, toA, fromB, toB, precise = true) {
    this.changes = changes;
    this.fromA = fromA;
    this.toA = toA;
    this.fromB = fromB;
    this.toB = toB;
    this.precise = precise;
  }
  /**
  @internal
  */
  offset(offA, offB) {
    return offA || offB ? new _Chunk(this.changes, this.fromA + offA, this.toA + offA, this.fromB + offB, this.toB + offB, this.precise) : this;
  }
  /**
  Returns `fromA` if the chunk is empty in A, or the end of the
  last line in the chunk otherwise.
  */
  get endA() {
    return Math.max(this.fromA, this.toA - 1);
  }
  /**
  Returns `fromB` if the chunk is empty in B, or the end of the
  last line in the chunk otherwise.
  */
  get endB() {
    return Math.max(this.fromB, this.toB - 1);
  }
  /**
  Build a set of changed chunks for the given documents.
  */
  static build(a, b, conf) {
    let diff2 = presentableDiff(a.toString(), b.toString(), conf);
    return toChunks(diff2, a, b, 0, 0, diffIsPrecise());
  }
  /**
  Update a set of chunks for changes in document A. `a` should
  hold the updated document A.
  */
  static updateA(chunks, a, b, changes, conf) {
    return updateChunks(findRangesForChange(chunks, changes, true, b.length), chunks, a, b, conf);
  }
  /**
  Update a set of chunks for changes in document B.
  */
  static updateB(chunks, a, b, changes, conf) {
    return updateChunks(findRangesForChange(chunks, changes, false, a.length), chunks, a, b, conf);
  }
};
function fromLine(fromA, fromB, a, b) {
  let lineA = a.lineAt(fromA), lineB = b.lineAt(fromB);
  return lineA.to == fromA && lineB.to == fromB && fromA < a.length && fromB < b.length ? [fromA + 1, fromB + 1] : [lineA.from, lineB.from];
}
function toLine(toA, toB, a, b) {
  let lineA = a.lineAt(toA), lineB = b.lineAt(toB);
  return lineA.from == toA && lineB.from == toB ? [toA, toB] : [lineA.to + 1, lineB.to + 1];
}
function toChunks(changes, a, b, offA, offB, precise) {
  let chunks = [];
  for (let i = 0; i < changes.length; i++) {
    let change = changes[i];
    let [fromA, fromB] = fromLine(change.fromA + offA, change.fromB + offB, a, b);
    let [toA, toB] = toLine(change.toA + offA, change.toB + offB, a, b);
    let chunk = [change.offset(-fromA + offA, -fromB + offB)];
    while (i < changes.length - 1) {
      let next = changes[i + 1];
      let [nextA, nextB] = fromLine(next.fromA + offA, next.fromB + offB, a, b);
      if (nextA > toA + 1 && nextB > toB + 1) break;
      chunk.push(next.offset(-fromA + offA, -fromB + offB));
      [toA, toB] = toLine(next.toA + offA, next.toB + offB, a, b);
      i++;
    }
    chunks.push(new Chunk(chunk, fromA, Math.max(fromA, toA), fromB, Math.max(fromB, toB), precise));
  }
  return chunks;
}
var updateMargin = 1e3;
function findPos(chunks, pos, isA, start) {
  let lo = 0, hi = chunks.length;
  for (; ; ) {
    if (lo == hi) {
      let refA = 0, refB = 0;
      if (lo) ({
        toA: refA,
        toB: refB
      } = chunks[lo - 1]);
      let off = pos - (isA ? refA : refB);
      return [refA + off, refB + off];
    }
    let mid = lo + hi >> 1, chunk = chunks[mid];
    let [from, to] = isA ? [chunk.fromA, chunk.toA] : [chunk.fromB, chunk.toB];
    if (from > pos) hi = mid;
    else if (to <= pos) lo = mid + 1;
    else return start ? [chunk.fromA, chunk.fromB] : [chunk.toA, chunk.toB];
  }
}
function findRangesForChange(chunks, changes, isA, otherLen) {
  let ranges = [];
  changes.iterChangedRanges((cFromA, cToA, cFromB, cToB) => {
    let fromA = 0, toA = isA ? changes.length : otherLen;
    let fromB = 0, toB = isA ? otherLen : changes.length;
    if (cFromA > updateMargin) [fromA, fromB] = findPos(chunks, cFromA - updateMargin, isA, true);
    if (cToA < changes.length - updateMargin) [toA, toB] = findPos(chunks, cToA + updateMargin, isA, false);
    let lenDiff = cToB - cFromB - (cToA - cFromA), last;
    let [diffA, diffB] = isA ? [lenDiff, 0] : [0, lenDiff];
    if (ranges.length && (last = ranges[ranges.length - 1]).toA >= fromA) ranges[ranges.length - 1] = {
      fromA: last.fromA,
      fromB: last.fromB,
      toA,
      toB,
      diffA: last.diffA + diffA,
      diffB: last.diffB + diffB
    };
    else ranges.push({
      fromA,
      toA,
      fromB,
      toB,
      diffA,
      diffB
    });
  });
  return ranges;
}
function updateChunks(ranges, chunks, a, b, conf) {
  if (!ranges.length) return chunks;
  let result = [];
  for (let i = 0, offA = 0, offB = 0, chunkI = 0; ; i++) {
    let range = i == ranges.length ? null : ranges[i];
    let fromA = range ? range.fromA + offA : a.length, fromB = range ? range.fromB + offB : b.length;
    while (chunkI < chunks.length) {
      let next = chunks[chunkI];
      if (next.toA + offA > fromA || next.toB + offB > fromB) break;
      result.push(next.offset(offA, offB));
      chunkI++;
    }
    if (!range) break;
    let toA = range.toA + offA + range.diffA, toB = range.toB + offB + range.diffB;
    let diff2 = presentableDiff(a.sliceString(fromA, toA), b.sliceString(fromB, toB), conf);
    for (let chunk of toChunks(diff2, a, b, fromA, fromB, diffIsPrecise())) result.push(chunk);
    offA += range.diffA;
    offB += range.diffB;
    while (chunkI < chunks.length) {
      let next = chunks[chunkI];
      if (next.fromA + offA > toA && next.fromB + offB > toB) break;
      chunkI++;
    }
  }
  return result;
}
var defaultDiffConfig = {
  scanLimit: 500
};
var decorateChunks = ViewPlugin.fromClass(class {
  constructor(view) {
    ({
      deco: this.deco,
      gutter: this.gutter
    } = getChunkDeco(view));
  }
  update(update) {
    if (update.docChanged || update.viewportChanged || chunksChanged(update.startState, update.state) || configChanged(update.startState, update.state)) ({
      deco: this.deco,
      gutter: this.gutter
    } = getChunkDeco(update.view));
  }
}, {
  decorations: (d) => d.deco
});
var changeGutter = Prec.low(gutter({
  class: "cm-changeGutter",
  markers: (view) => {
    var _a;
    return ((_a = view.plugin(decorateChunks)) === null || _a === void 0 ? void 0 : _a.gutter) || RangeSet.empty;
  }
}));
function chunksChanged(s1, s2) {
  return s1.field(ChunkField, false) != s2.field(ChunkField, false);
}
function configChanged(s1, s2) {
  return s1.facet(mergeConfig) != s2.facet(mergeConfig);
}
var changedLine = Decoration.line({
  class: "cm-changedLine"
});
var changedText = Decoration.mark({
  class: "cm-changedText"
});
var inserted = Decoration.mark({
  tagName: "ins",
  class: "cm-insertedLine"
});
var deleted = Decoration.mark({
  tagName: "del",
  class: "cm-deletedLine"
});
var changedLineGutterMarker = new class extends GutterMarker {
  constructor() {
    super(...arguments);
    this.elementClass = "cm-changedLineGutter";
  }
}();
function buildChunkDeco(chunk, doc, isA, highlight, builder, gutterBuilder) {
  let from = isA ? chunk.fromA : chunk.fromB, to = isA ? chunk.toA : chunk.toB;
  let changeI = 0;
  if (from != to) {
    builder.add(from, from, changedLine);
    builder.add(from, to, isA ? deleted : inserted);
    if (gutterBuilder) gutterBuilder.add(from, from, changedLineGutterMarker);
    for (let iter = doc.iterRange(from, to - 1), pos = from; !iter.next().done; ) {
      if (iter.lineBreak) {
        pos++;
        builder.add(pos, pos, changedLine);
        if (gutterBuilder) gutterBuilder.add(pos, pos, changedLineGutterMarker);
        continue;
      }
      let lineEnd = pos + iter.value.length;
      if (highlight) while (changeI < chunk.changes.length) {
        let nextChange = chunk.changes[changeI];
        let nextFrom = from + (isA ? nextChange.fromA : nextChange.fromB);
        let nextTo = from + (isA ? nextChange.toA : nextChange.toB);
        let chFrom = Math.max(pos, nextFrom), chTo = Math.min(lineEnd, nextTo);
        if (chFrom < chTo) builder.add(chFrom, chTo, changedText);
        if (nextTo < lineEnd) changeI++;
        else break;
      }
      pos = lineEnd;
    }
  }
}
function getChunkDeco(view) {
  let chunks = view.state.field(ChunkField);
  let {
    side,
    highlightChanges,
    markGutter,
    overrideChunk
  } = view.state.facet(mergeConfig), isA = side == "a";
  let builder = new RangeSetBuilder();
  let gutterBuilder = markGutter ? new RangeSetBuilder() : null;
  let {
    from,
    to
  } = view.viewport;
  for (let chunk of chunks) {
    if ((isA ? chunk.fromA : chunk.fromB) >= to) break;
    if ((isA ? chunk.toA : chunk.toB) > from) {
      if (!overrideChunk || !overrideChunk(view.state, chunk, builder, gutterBuilder)) buildChunkDeco(chunk, view.state.doc, isA, highlightChanges, builder, gutterBuilder);
    }
  }
  return {
    deco: builder.finish(),
    gutter: gutterBuilder && gutterBuilder.finish()
  };
}
var Spacer = class extends WidgetType {
  constructor(height) {
    super();
    this.height = height;
  }
  eq(other) {
    return this.height == other.height;
  }
  toDOM() {
    let elt = document.createElement("div");
    elt.className = "cm-mergeSpacer";
    elt.style.height = this.height + "px";
    return elt;
  }
  updateDOM(dom) {
    dom.style.height = this.height + "px";
    return true;
  }
  get estimatedHeight() {
    return this.height;
  }
  ignoreEvent() {
    return false;
  }
};
var adjustSpacers = StateEffect.define({
  map: (value, mapping) => value.map(mapping)
});
var Spacers = StateField.define({
  create: () => Decoration.none,
  update: (spacers, tr) => {
    for (let e of tr.effects) if (e.is(adjustSpacers)) return e.value;
    return spacers.map(tr.changes);
  },
  provide: (f) => EditorView.decorations.from(f)
});
var epsilon = 0.01;
function compareSpacers(a, b) {
  if (a.size != b.size) return false;
  let iA = a.iter(), iB = b.iter();
  while (iA.value) {
    if (iA.from != iB.from || Math.abs(iA.value.spec.widget.height - iB.value.spec.widget.height) > 1) return false;
    iA.next();
    iB.next();
  }
  return true;
}
function updateSpacers(a, b, chunks) {
  let buildA = new RangeSetBuilder(), buildB = new RangeSetBuilder();
  let spacersA = a.state.field(Spacers).iter(), spacersB = b.state.field(Spacers).iter();
  let posA = 0, posB = 0, offA = 0, offB = 0, vpA = a.viewport, vpB = b.viewport;
  for (let chunkI = 0; ; chunkI++) {
    let chunk = chunkI < chunks.length ? chunks[chunkI] : null;
    let endA = chunk ? chunk.fromA : a.state.doc.length, endB = chunk ? chunk.fromB : b.state.doc.length;
    if (posA < endA) {
      let heightA = a.lineBlockAt(posA).top + offA;
      let heightB = b.lineBlockAt(posB).top + offB;
      let diff2 = heightA - heightB;
      if (diff2 < -epsilon) {
        offA -= diff2;
        buildA.add(posA, posA, Decoration.widget({
          widget: new Spacer(-diff2),
          block: true,
          side: -1
        }));
      } else if (diff2 > epsilon) {
        offB += diff2;
        buildB.add(posB, posB, Decoration.widget({
          widget: new Spacer(diff2),
          block: true,
          side: -1
        }));
      }
    }
    if (endA > posA + 1e3 && posA < vpA.from && endA > vpA.from && posB < vpB.from && endB > vpB.from) {
      let off = Math.min(vpA.from - posA, vpB.from - posB);
      posA += off;
      posB += off;
      chunkI--;
    } else if (!chunk) {
      break;
    } else {
      posA = chunk.toA;
      posB = chunk.toB;
    }
    while (spacersA.value && spacersA.from < posA) {
      offA -= spacersA.value.spec.widget.height;
      spacersA.next();
    }
    while (spacersB.value && spacersB.from < posB) {
      offB -= spacersB.value.spec.widget.height;
      spacersB.next();
    }
  }
  while (spacersA.value) {
    offA -= spacersA.value.spec.widget.height;
    spacersA.next();
  }
  while (spacersB.value) {
    offB -= spacersB.value.spec.widget.height;
    spacersB.next();
  }
  let docDiff = a.contentHeight + offA - (b.contentHeight + offB);
  if (docDiff < epsilon) {
    buildA.add(a.state.doc.length, a.state.doc.length, Decoration.widget({
      widget: new Spacer(-docDiff),
      block: true,
      side: 1
    }));
  } else if (docDiff > epsilon) {
    buildB.add(b.state.doc.length, b.state.doc.length, Decoration.widget({
      widget: new Spacer(docDiff),
      block: true,
      side: 1
    }));
  }
  let decoA = buildA.finish(), decoB = buildB.finish();
  if (!compareSpacers(decoA, a.state.field(Spacers))) a.dispatch({
    effects: adjustSpacers.of(decoA)
  });
  if (!compareSpacers(decoB, b.state.field(Spacers))) b.dispatch({
    effects: adjustSpacers.of(decoB)
  });
}
var uncollapseUnchanged = StateEffect.define({
  map: (value, change) => change.mapPos(value)
});
var CollapseWidget = class extends WidgetType {
  constructor(lines) {
    super();
    this.lines = lines;
  }
  eq(other) {
    return this.lines == other.lines;
  }
  toDOM(view) {
    let outer = document.createElement("div");
    outer.className = "cm-collapsedLines";
    outer.textContent = view.state.phrase("$ unchanged lines", this.lines);
    outer.addEventListener("click", (e) => {
      let pos = view.posAtDOM(e.target);
      view.dispatch({
        effects: uncollapseUnchanged.of(pos)
      });
      let {
        side,
        sibling
      } = view.state.facet(mergeConfig);
      if (sibling) sibling().dispatch({
        effects: uncollapseUnchanged.of(mapPos(pos, view.state.field(ChunkField), side == "a"))
      });
    });
    return outer;
  }
  ignoreEvent(e) {
    return e instanceof MouseEvent;
  }
  get estimatedHeight() {
    return 27;
  }
  get type() {
    return "collapsed-unchanged-code";
  }
};
function mapPos(pos, chunks, isA) {
  let startOur = 0, startOther = 0;
  for (let i = 0; ; i++) {
    let next = i < chunks.length ? chunks[i] : null;
    if (!next || (isA ? next.fromA : next.fromB) >= pos) return startOther + (pos - startOur);
    [startOur, startOther] = isA ? [next.toA, next.toB] : [next.toB, next.toA];
  }
}
var CollapsedRanges = StateField.define({
  create(state) {
    return Decoration.none;
  },
  update(deco, tr) {
    deco = deco.map(tr.changes);
    for (let e of tr.effects) if (e.is(uncollapseUnchanged)) deco = deco.update({
      filter: (from) => from != e.value
    });
    return deco;
  },
  provide: (f) => EditorView.decorations.from(f)
});
function collapseUnchanged({
  margin = 3,
  minSize = 4
}) {
  return CollapsedRanges.init((state) => buildCollapsedRanges(state, margin, minSize));
}
function buildCollapsedRanges(state, margin, minLines) {
  let builder = new RangeSetBuilder();
  let isA = state.facet(mergeConfig).side == "a";
  let chunks = state.field(ChunkField);
  let prevLine = 1;
  for (let i = 0; ; i++) {
    let chunk = i < chunks.length ? chunks[i] : null;
    let collapseFrom = i ? prevLine + margin : 1;
    let collapseTo = chunk ? state.doc.lineAt(isA ? chunk.fromA : chunk.fromB).number - 1 - margin : state.doc.lines;
    let lines = collapseTo - collapseFrom + 1;
    if (lines >= minLines) {
      builder.add(state.doc.line(collapseFrom).from, state.doc.line(collapseTo).to, Decoration.replace({
        widget: new CollapseWidget(lines),
        block: true
      }));
    }
    if (!chunk) break;
    prevLine = state.doc.lineAt(Math.min(state.doc.length, isA ? chunk.toA : chunk.toB)).number;
  }
  return builder.finish();
}
var externalTheme = EditorView.styleModule.of(new StyleModule({
  ".cm-mergeView": {
    overflowY: "auto"
  },
  ".cm-mergeViewEditors": {
    display: "flex",
    alignItems: "stretch"
  },
  ".cm-mergeViewEditor": {
    flexGrow: 1,
    flexBasis: 0,
    overflow: "hidden"
  },
  ".cm-merge-revert": {
    width: "1.6em",
    flexGrow: 0,
    flexShrink: 0,
    position: "relative"
  },
  ".cm-merge-revert button": {
    position: "absolute",
    display: "block",
    width: "100%",
    boxSizing: "border-box",
    textAlign: "center",
    background: "none",
    border: "none",
    font: "inherit",
    cursor: "pointer"
  }
}));
var baseTheme3 = EditorView.baseTheme({
  ".cm-mergeView & .cm-scroller, .cm-mergeView &": {
    height: "auto !important",
    overflowY: "visible !important"
  },
  "&.cm-merge-a .cm-changedLine, .cm-deletedChunk": {
    backgroundColor: "rgba(160, 128, 100, .08)"
  },
  "&.cm-merge-b .cm-changedLine, .cm-inlineChangedLine": {
    backgroundColor: "rgba(100, 160, 128, .08)"
  },
  "&light.cm-merge-a .cm-changedText, &light .cm-deletedChunk .cm-deletedText": {
    background: "linear-gradient(#ee443366, #ee443366) bottom/100% 2px no-repeat"
  },
  "&dark.cm-merge-a .cm-changedText, &dark .cm-deletedChunk .cm-deletedText": {
    background: "linear-gradient(#ffaa9966, #ffaa9966) bottom/100% 2px no-repeat"
  },
  "&light.cm-merge-b .cm-changedText": {
    background: "linear-gradient(#22bb22aa, #22bb22aa) bottom/100% 2px no-repeat"
  },
  "&dark.cm-merge-b .cm-changedText": {
    background: "linear-gradient(#88ff88aa, #88ff88aa) bottom/100% 2px no-repeat"
  },
  "&.cm-merge-b .cm-deletedText": {
    background: "#ff000033"
  },
  ".cm-insertedLine, .cm-deletedLine, .cm-deletedLine del": {
    textDecoration: "none"
  },
  ".cm-deletedChunk": {
    paddingLeft: "6px",
    "& .cm-chunkButtons": {
      position: "absolute",
      insetInlineEnd: "5px"
    },
    "& button": {
      border: "none",
      cursor: "pointer",
      color: "white",
      margin: "0 2px",
      borderRadius: "3px",
      "&[name=accept]": {
        background: "#2a2"
      },
      "&[name=reject]": {
        background: "#d43"
      }
    }
  },
  ".cm-collapsedLines": {
    padding: "5px 5px 5px 10px",
    cursor: "pointer",
    "&:before": {
      content: '"⦚"',
      marginInlineEnd: "7px"
    },
    "&:after": {
      content: '"⦚"',
      marginInlineStart: "7px"
    }
  },
  "&light .cm-collapsedLines": {
    color: "#444",
    background: "linear-gradient(to bottom, transparent 0, #f3f3f3 30%, #f3f3f3 70%, transparent 100%)"
  },
  "&dark .cm-collapsedLines": {
    color: "#ddd",
    background: "linear-gradient(to bottom, transparent 0, #222 30%, #222 70%, transparent 100%)"
  },
  ".cm-changeGutter": {
    width: "3px",
    paddingLeft: "1px"
  },
  "&light.cm-merge-a .cm-changedLineGutter, &light .cm-deletedLineGutter": {
    background: "#e43"
  },
  "&dark.cm-merge-a .cm-changedLineGutter, &dark .cm-deletedLineGutter": {
    background: "#fa9"
  },
  "&light.cm-merge-b .cm-changedLineGutter": {
    background: "#2b2"
  },
  "&dark.cm-merge-b .cm-changedLineGutter": {
    background: "#8f8"
  },
  ".cm-inlineChangedLineGutter": {
    background: "#75d"
  }
});
var collapseCompartment = new Compartment();
var configCompartment = new Compartment();
var MergeView = class {
  /**
  Create a new merge view.
  */
  constructor(config) {
    this.revertDOM = null;
    this.revertToA = false;
    this.revertToLeft = false;
    this.measuring = -1;
    this.diffConf = config.diffConfig || defaultDiffConfig;
    let sharedExtensions = [Prec.low(decorateChunks), baseTheme3, externalTheme, Spacers, EditorView.updateListener.of((update) => {
      if (this.measuring < 0 && (update.heightChanged || update.viewportChanged) && !update.transactions.some((tr) => tr.effects.some((e) => e.is(adjustSpacers)))) this.measure();
    })];
    let configA = [mergeConfig.of({
      side: "a",
      sibling: () => this.b,
      highlightChanges: config.highlightChanges !== false,
      markGutter: config.gutter !== false
    })];
    if (config.gutter !== false) configA.push(changeGutter);
    let stateA = EditorState.create({
      doc: config.a.doc,
      selection: config.a.selection,
      extensions: [config.a.extensions || [], EditorView.editorAttributes.of({
        class: "cm-merge-a"
      }), configCompartment.of(configA), sharedExtensions]
    });
    let configB = [mergeConfig.of({
      side: "b",
      sibling: () => this.a,
      highlightChanges: config.highlightChanges !== false,
      markGutter: config.gutter !== false
    })];
    if (config.gutter !== false) configB.push(changeGutter);
    let stateB = EditorState.create({
      doc: config.b.doc,
      selection: config.b.selection,
      extensions: [config.b.extensions || [], EditorView.editorAttributes.of({
        class: "cm-merge-b"
      }), configCompartment.of(configB), sharedExtensions]
    });
    this.chunks = Chunk.build(stateA.doc, stateB.doc, this.diffConf);
    let add2 = [ChunkField.init(() => this.chunks), collapseCompartment.of(config.collapseUnchanged ? collapseUnchanged(config.collapseUnchanged) : [])];
    stateA = stateA.update({
      effects: StateEffect.appendConfig.of(add2)
    }).state;
    stateB = stateB.update({
      effects: StateEffect.appendConfig.of(add2)
    }).state;
    this.dom = document.createElement("div");
    this.dom.className = "cm-mergeView";
    this.editorDOM = this.dom.appendChild(document.createElement("div"));
    this.editorDOM.className = "cm-mergeViewEditors";
    let orientation = config.orientation || "a-b";
    let wrapA = document.createElement("div");
    wrapA.className = "cm-mergeViewEditor";
    let wrapB = document.createElement("div");
    wrapB.className = "cm-mergeViewEditor";
    this.editorDOM.appendChild(orientation == "a-b" ? wrapA : wrapB);
    this.editorDOM.appendChild(orientation == "a-b" ? wrapB : wrapA);
    this.a = new EditorView({
      state: stateA,
      parent: wrapA,
      root: config.root,
      dispatchTransactions: (trs) => this.dispatch(trs, this.a)
    });
    this.b = new EditorView({
      state: stateB,
      parent: wrapB,
      root: config.root,
      dispatchTransactions: (trs) => this.dispatch(trs, this.b)
    });
    this.setupRevertControls(!!config.revertControls, config.revertControls == "b-to-a", config.renderRevertControl);
    if (config.parent) config.parent.appendChild(this.dom);
    this.scheduleMeasure();
  }
  dispatch(trs, target) {
    if (trs.some((tr) => tr.docChanged)) {
      let last = trs[trs.length - 1];
      let changes = trs.reduce((chs, tr) => chs.compose(tr.changes), ChangeSet.empty(trs[0].startState.doc.length));
      this.chunks = target == this.a ? Chunk.updateA(this.chunks, last.newDoc, this.b.state.doc, changes, this.diffConf) : Chunk.updateB(this.chunks, this.a.state.doc, last.newDoc, changes, this.diffConf);
      target.update([...trs, last.state.update({
        effects: setChunks.of(this.chunks)
      })]);
      let other = target == this.a ? this.b : this.a;
      other.update([other.state.update({
        effects: setChunks.of(this.chunks)
      })]);
      this.scheduleMeasure();
    } else {
      target.update(trs);
    }
  }
  /**
  Reconfigure an existing merge view.
  */
  reconfigure(config) {
    if ("diffConfig" in config) {
      this.diffConf = config.diffConfig;
    }
    if ("orientation" in config) {
      let aB = config.orientation != "b-a";
      if (aB != (this.editorDOM.firstChild == this.a.dom.parentNode)) {
        let domA = this.a.dom.parentNode, domB = this.b.dom.parentNode;
        domA.remove();
        domB.remove();
        this.editorDOM.insertBefore(aB ? domA : domB, this.editorDOM.firstChild);
        this.editorDOM.appendChild(aB ? domB : domA);
        this.revertToLeft = !this.revertToLeft;
        if (this.revertDOM) this.revertDOM.textContent = "";
      }
    }
    if ("revertControls" in config || "renderRevertControl" in config) {
      let controls = !!this.revertDOM, toA = this.revertToA, render = this.renderRevert;
      if ("revertControls" in config) {
        controls = !!config.revertControls;
        toA = config.revertControls == "b-to-a";
      }
      if ("renderRevertControl" in config) render = config.renderRevertControl;
      this.setupRevertControls(controls, toA, render);
    }
    let highlight = "highlightChanges" in config, gutter2 = "gutter" in config, collapse = "collapseUnchanged" in config;
    if (highlight || gutter2 || collapse) {
      let effectsA = [], effectsB = [];
      if (highlight || gutter2) {
        let currentConfig = this.a.state.facet(mergeConfig);
        let markGutter = gutter2 ? config.gutter !== false : currentConfig.markGutter;
        let highlightChanges = highlight ? config.highlightChanges !== false : currentConfig.highlightChanges;
        effectsA.push(configCompartment.reconfigure([mergeConfig.of({
          side: "a",
          sibling: () => this.b,
          highlightChanges,
          markGutter
        }), markGutter ? changeGutter : []]));
        effectsB.push(configCompartment.reconfigure([mergeConfig.of({
          side: "b",
          sibling: () => this.a,
          highlightChanges,
          markGutter
        }), markGutter ? changeGutter : []]));
      }
      if (collapse) {
        let effect = collapseCompartment.reconfigure(config.collapseUnchanged ? collapseUnchanged(config.collapseUnchanged) : []);
        effectsA.push(effect);
        effectsB.push(effect);
      }
      this.a.dispatch({
        effects: effectsA
      });
      this.b.dispatch({
        effects: effectsB
      });
    }
    this.scheduleMeasure();
  }
  setupRevertControls(controls, toA, render) {
    this.revertToA = toA;
    this.revertToLeft = this.revertToA == (this.editorDOM.firstChild == this.a.dom.parentNode);
    this.renderRevert = render;
    if (!controls && this.revertDOM) {
      this.revertDOM.remove();
      this.revertDOM = null;
    } else if (controls && !this.revertDOM) {
      this.revertDOM = this.editorDOM.insertBefore(document.createElement("div"), this.editorDOM.firstChild.nextSibling);
      this.revertDOM.addEventListener("mousedown", (e) => this.revertClicked(e));
      this.revertDOM.className = "cm-merge-revert";
    } else if (this.revertDOM) {
      this.revertDOM.textContent = "";
    }
  }
  scheduleMeasure() {
    if (this.measuring < 0) {
      let win = this.dom.ownerDocument.defaultView || window;
      this.measuring = win.requestAnimationFrame(() => {
        this.measuring = -1;
        this.measure();
      });
    }
  }
  measure() {
    updateSpacers(this.a, this.b, this.chunks);
    if (this.revertDOM) this.updateRevertButtons();
  }
  updateRevertButtons() {
    let dom = this.revertDOM, next = dom.firstChild;
    let vpA = this.a.viewport, vpB = this.b.viewport;
    for (let i = 0; i < this.chunks.length; i++) {
      let chunk = this.chunks[i];
      if (chunk.fromA > vpA.to || chunk.fromB > vpB.to) break;
      if (chunk.fromA < vpA.from || chunk.fromB < vpB.from) continue;
      let top = this.a.lineBlockAt(chunk.fromA).top + "px";
      while (next && +next.dataset.chunk < i) next = rm(next);
      if (next && next.dataset.chunk == String(i)) {
        if (next.style.top != top) next.style.top = top;
        next = next.nextSibling;
      } else {
        dom.insertBefore(this.renderRevertButton(top, i), next);
      }
    }
    while (next) next = rm(next);
  }
  renderRevertButton(top, chunk) {
    let elt;
    if (this.renderRevert) {
      elt = this.renderRevert();
    } else {
      elt = document.createElement("button");
      let text = this.a.state.phrase("Revert this chunk");
      elt.setAttribute("aria-label", text);
      elt.setAttribute("title", text);
      elt.textContent = this.revertToLeft ? "⇜" : "⇝";
    }
    elt.style.top = top;
    elt.setAttribute("data-chunk", String(chunk));
    return elt;
  }
  revertClicked(e) {
    let target = e.target, chunk;
    while (target && target.parentNode != this.revertDOM) target = target.parentNode;
    if (target && (chunk = this.chunks[target.dataset.chunk])) {
      let [source, dest, srcFrom, srcTo, destFrom, destTo] = this.revertToA ? [this.b, this.a, chunk.fromB, chunk.toB, chunk.fromA, chunk.toA] : [this.a, this.b, chunk.fromA, chunk.toA, chunk.fromB, chunk.toB];
      let insert = source.state.sliceDoc(srcFrom, Math.max(srcFrom, srcTo - 1));
      if (srcFrom != srcTo && destTo <= dest.state.doc.length) insert += source.state.lineBreak;
      dest.dispatch({
        changes: {
          from: destFrom,
          to: Math.min(dest.state.doc.length, destTo),
          insert
        },
        userEvent: "revert"
      });
      e.preventDefault();
    }
  }
  /**
  Destroy this merge view.
  */
  destroy() {
    this.a.destroy();
    this.b.destroy();
    if (this.measuring > -1) (this.dom.ownerDocument.defaultView || window).cancelAnimationFrame(this.measuring);
    this.dom.remove();
  }
};
function rm(elt) {
  let next = elt.nextSibling;
  elt.remove();
  return next;
}
var deletedChunkGutterMarker = new class extends GutterMarker {
  constructor() {
    super(...arguments);
    this.elementClass = "cm-deletedLineGutter";
  }
}();
var unifiedChangeGutter = Prec.low(gutter({
  class: "cm-changeGutter",
  markers: (view) => {
    var _a;
    return ((_a = view.plugin(decorateChunks)) === null || _a === void 0 ? void 0 : _a.gutter) || RangeSet.empty;
  },
  widgetMarker: (view, widget) => widget instanceof DeletionWidget ? deletedChunkGutterMarker : null
}));
var updateOriginalDoc = StateEffect.define();
var originalDoc = StateField.define({
  create: () => Text.empty,
  update(doc, tr) {
    for (let e of tr.effects) if (e.is(updateOriginalDoc)) doc = e.value.doc;
    return doc;
  }
});
var DeletionWidgets = /* @__PURE__ */ new WeakMap();
var DeletionWidget = class extends WidgetType {
  constructor(buildDOM) {
    super();
    this.buildDOM = buildDOM;
    this.dom = null;
  }
  eq(other) {
    return this.dom == other.dom;
  }
  toDOM(view) {
    return this.dom || (this.dom = this.buildDOM(view));
  }
};
function deletionWidget(state, chunk, hideContent) {
  let known = DeletionWidgets.get(chunk.changes);
  if (known) return known;
  let buildDOM = (view) => {
    let {
      highlightChanges,
      syntaxHighlightDeletions,
      syntaxHighlightDeletionsMaxLength,
      mergeControls
    } = state.facet(mergeConfig);
    let dom = document.createElement("div");
    dom.className = "cm-deletedChunk";
    if (mergeControls) {
      let buttons = dom.appendChild(document.createElement("div"));
      buttons.className = "cm-chunkButtons";
      let accept = buttons.appendChild(document.createElement("button"));
      accept.name = "accept";
      accept.textContent = state.phrase("Accept");
      accept.onmousedown = (e) => {
        e.preventDefault();
        acceptChunk(view, view.posAtDOM(dom));
      };
      let reject = buttons.appendChild(document.createElement("button"));
      reject.name = "reject";
      reject.textContent = state.phrase("Reject");
      reject.onmousedown = (e) => {
        e.preventDefault();
        rejectChunk(view, view.posAtDOM(dom));
      };
    }
    if (hideContent || chunk.fromA >= chunk.toA) return dom;
    let text = view.state.field(originalDoc).sliceString(chunk.fromA, chunk.endA);
    let lang = syntaxHighlightDeletions && state.facet(language);
    let line = makeLine();
    let changes = chunk.changes, changeI = 0, inside = false;
    function makeLine() {
      let div = dom.appendChild(document.createElement("div"));
      div.className = "cm-deletedLine";
      return div.appendChild(document.createElement("del"));
    }
    function add2(from, to, cls) {
      for (let at = from; at < to; ) {
        if (text.charAt(at) == "\n") {
          if (!line.firstChild) line.appendChild(document.createElement("br"));
          line = makeLine();
          at++;
          continue;
        }
        let nextStop = to, nodeCls = cls + (inside ? " cm-deletedText" : ""), flip = false;
        let newline = text.indexOf("\n", at);
        if (newline > -1 && newline < to) nextStop = newline;
        if (highlightChanges && changeI < changes.length) {
          let nextBound = Math.max(0, inside ? changes[changeI].toA : changes[changeI].fromA);
          if (nextBound <= nextStop) {
            nextStop = nextBound;
            if (inside) changeI++;
            flip = true;
          }
        }
        if (nextStop > at) {
          let node = document.createTextNode(text.slice(at, nextStop));
          if (nodeCls) {
            let span = line.appendChild(document.createElement("span"));
            span.className = nodeCls;
            span.appendChild(node);
          } else {
            line.appendChild(node);
          }
          at = nextStop;
        }
        if (flip) inside = !inside;
      }
    }
    if (lang && chunk.toA - chunk.fromA <= syntaxHighlightDeletionsMaxLength) {
      let tree = lang.parser.parse(text), pos = 0;
      highlightTree(tree, {
        style: (tags2) => highlightingFor(state, tags2)
      }, (from, to, cls) => {
        if (from > pos) add2(pos, from, "");
        add2(from, to, cls);
        pos = to;
      });
      add2(pos, text.length, "");
    } else {
      add2(0, text.length, "");
    }
    if (!line.firstChild) line.appendChild(document.createElement("br"));
    return dom;
  };
  let deco = Decoration.widget({
    block: true,
    side: -1,
    widget: new DeletionWidget(buildDOM)
  });
  DeletionWidgets.set(chunk.changes, deco);
  return deco;
}
function acceptChunk(view, pos) {
  let {
    state
  } = view, at = pos !== null && pos !== void 0 ? pos : state.selection.main.head;
  let chunk = view.state.field(ChunkField).find((ch) => ch.fromB <= at && ch.endB >= at);
  if (!chunk) return false;
  let insert = view.state.sliceDoc(chunk.fromB, Math.max(chunk.fromB, chunk.toB - 1));
  let orig = view.state.field(originalDoc);
  if (chunk.fromB != chunk.toB && chunk.toA <= orig.length) insert += view.state.lineBreak;
  let changes = ChangeSet.of({
    from: chunk.fromA,
    to: Math.min(orig.length, chunk.toA),
    insert
  }, orig.length);
  view.dispatch({
    effects: updateOriginalDoc.of({
      doc: changes.apply(orig),
      changes
    }),
    userEvent: "accept"
  });
  return true;
}
function rejectChunk(view, pos) {
  let {
    state
  } = view, at = pos !== null && pos !== void 0 ? pos : state.selection.main.head;
  let chunk = state.field(ChunkField).find((ch) => ch.fromB <= at && ch.endB >= at);
  if (!chunk) return false;
  let orig = state.field(originalDoc);
  let insert = orig.sliceString(chunk.fromA, Math.max(chunk.fromA, chunk.toA - 1));
  if (chunk.fromA != chunk.toA && chunk.toB <= state.doc.length) insert += state.lineBreak;
  view.dispatch({
    changes: {
      from: chunk.fromB,
      to: Math.min(state.doc.length, chunk.toB),
      insert
    },
    userEvent: "revert"
  });
  return true;
}
function buildDeletedChunks(state) {
  let builder = new RangeSetBuilder();
  for (let ch of state.field(ChunkField)) {
    let hide = state.facet(mergeConfig).overrideChunk && chunkCanDisplayInline(state, ch);
    builder.add(ch.fromB, ch.fromB, deletionWidget(state, ch, !!hide));
  }
  return builder.finish();
}
var deletedChunks = StateField.define({
  create: (state) => buildDeletedChunks(state),
  update(deco, tr) {
    return tr.state.field(ChunkField, false) != tr.startState.field(ChunkField, false) ? buildDeletedChunks(tr.state) : deco;
  },
  provide: (f) => EditorView.decorations.from(f)
});
var InlineChunkCache = /* @__PURE__ */ new WeakMap();
function chunkCanDisplayInline(state, chunk) {
  let result = InlineChunkCache.get(chunk);
  if (result !== void 0) return result;
  result = null;
  let a = state.field(originalDoc), b = state.doc;
  let linesA = a.lineAt(chunk.endA).number - a.lineAt(chunk.fromA).number + 1;
  let linesB = b.lineAt(chunk.endB).number - b.lineAt(chunk.fromB).number + 1;
  abort: if (linesA == linesB && linesA < 10) {
    let deco = [], deleteCount = 0;
    let bA = chunk.fromA, bB = chunk.fromB;
    for (let ch of chunk.changes) {
      if (ch.fromA < ch.toA) {
        deleteCount += ch.toA - ch.fromA;
        let deleted2 = a.sliceString(bA + ch.fromA, bA + ch.toA);
        if (/\n/.test(deleted2)) break abort;
        deco.push(Decoration.widget({
          widget: new InlineDeletion(deleted2),
          side: -1
        }).range(bB + ch.fromB));
      }
      if (ch.fromB < ch.toB) {
        deco.push(changedText.range(bB + ch.fromB, bB + ch.toB));
      }
    }
    if (deleteCount < chunk.endA - chunk.fromA - linesA * 2) result = deco;
  }
  InlineChunkCache.set(chunk, result);
  return result;
}
var InlineDeletion = class extends WidgetType {
  constructor(text) {
    super();
    this.text = text;
  }
  eq(other) {
    return this.text == other.text;
  }
  toDOM(view) {
    let elt = document.createElement("del");
    elt.className = "cm-deletedText";
    elt.textContent = this.text;
    return elt;
  }
};
var inlineChangedLineGutterMarker = new class extends GutterMarker {
  constructor() {
    super(...arguments);
    this.elementClass = "cm-inlineChangedLineGutter";
  }
}();
var inlineChangedLine = Decoration.line({
  class: "cm-inlineChangedLine"
});

// node_modules/@acrodata/code-editor/fesm2022/acrodata-code-editor.mjs
var External = Annotation.define();
var CodeEditor = class _CodeEditor {
  constructor(_elementRef) {
    this._elementRef = _elementRef;
    this.autoFocus = false;
    this.value = "";
    this.disabled = false;
    this.readonly = false;
    this.theme = "light";
    this.placeholder = "";
    this.indentWithTab = false;
    this.indentUnit = "";
    this.lineWrapping = false;
    this.highlightWhitespace = false;
    this.languages = [];
    this.language = "";
    this.setup = "basic";
    this.extensions = [];
    this.change = new EventEmitter();
    this.focus = new EventEmitter();
    this.blur = new EventEmitter();
    this._onChange = () => {
    };
    this._onTouched = () => {
    };
    this._updateListener = EditorView.updateListener.of((vu) => {
      if (vu.docChanged && !vu.transactions.some((tr) => tr.annotation(External))) {
        const value = vu.state.doc.toString();
        this._onChange(value);
        this.change.emit(value);
      }
    });
    this._editableConf = new Compartment();
    this._readonlyConf = new Compartment();
    this._themeConf = new Compartment();
    this._placeholderConf = new Compartment();
    this._indentWithTabConf = new Compartment();
    this._indentUnitConf = new Compartment();
    this._lineWrappingConf = new Compartment();
    this._highlightWhitespaceConf = new Compartment();
    this._languageConf = new Compartment();
  }
  _getAllExtensions() {
    return [this._updateListener, this._editableConf.of([]), this._readonlyConf.of([]), this._themeConf.of([]), this._placeholderConf.of([]), this._indentWithTabConf.of([]), this._indentUnitConf.of([]), this._lineWrappingConf.of([]), this._highlightWhitespaceConf.of([]), this._languageConf.of([]), this.setup === "basic" ? basicSetup : this.setup === "minimal" ? minimalSetup : [], ...this.extensions];
  }
  ngOnChanges(changes) {
    if (changes["value"]) {
      this.setValue(this.value);
    }
    if (changes["disabled"]) {
      this.setEditable(!this.disabled);
    }
    if (changes["readonly"]) {
      this.setReadonly(this.readonly);
    }
    if (changes["theme"]) {
      this.setTheme(this.theme);
    }
    if (changes["placeholder"]) {
      this.setPlaceholder(this.placeholder);
    }
    if (changes["indentWithTab"]) {
      this.setIndentWithTab(this.indentWithTab);
    }
    if (changes["indentUnit"]) {
      this.setIndentUnit(this.indentUnit);
    }
    if (changes["lineWrapping"]) {
      this.setLineWrapping(this.lineWrapping);
    }
    if (changes["highlightWhitespace"]) {
      this.setHighlightWhitespace(this.highlightWhitespace);
    }
    if (changes["language"]) {
      this.setLanguage(this.language);
    }
    if (changes["setup"] || changes["extensions"]) {
      this.setExtensions(this._getAllExtensions());
    }
  }
  ngOnInit() {
    this.view = new EditorView({
      root: this.root,
      parent: this._elementRef.nativeElement,
      state: EditorState.create({
        doc: this.value,
        extensions: this._getAllExtensions()
      })
    });
    if (this.autoFocus) {
      this.view?.focus();
    }
    this.view?.contentDOM.addEventListener("focus", () => {
      this._onTouched();
      this.focus.emit();
    });
    this.view?.contentDOM.addEventListener("blur", () => {
      this._onTouched();
      this.blur.emit();
    });
    this.setEditable(!this.disabled);
    this.setReadonly(this.readonly);
    this.setTheme(this.theme);
    this.setPlaceholder(this.placeholder);
    this.setIndentWithTab(this.indentWithTab);
    this.setIndentUnit(this.indentUnit);
    this.setLineWrapping(this.lineWrapping);
    this.setHighlightWhitespace(this.highlightWhitespace);
    this.setLanguage(this.language);
  }
  ngOnDestroy() {
    this.view?.destroy();
  }
  writeValue(value) {
    if (this.view) {
      this.setValue(value);
    }
  }
  registerOnChange(fn) {
    this._onChange = fn;
  }
  registerOnTouched(fn) {
    this._onTouched = fn;
  }
  setDisabledState(isDisabled) {
    this.disabled = isDisabled;
    this.setEditable(!isDisabled);
  }
  /** Sets editor's value. */
  setValue(value) {
    this.view?.dispatch({
      changes: {
        from: 0,
        to: this.view.state.doc.length,
        insert: value
      }
    });
  }
  _dispatchEffects(effects) {
    return this.view?.dispatch({
      effects
    });
  }
  /** Sets the root extensions of the editor. */
  setExtensions(value) {
    this._dispatchEffects(StateEffect.reconfigure.of(value));
  }
  /** Sets editor's editable state. */
  setEditable(value) {
    this._dispatchEffects(this._editableConf.reconfigure(EditorView.editable.of(value)));
  }
  /** Sets editor's readonly state. */
  setReadonly(value) {
    this._dispatchEffects(this._readonlyConf.reconfigure(EditorState.readOnly.of(value)));
  }
  /** Sets editor's theme. */
  setTheme(value) {
    this._dispatchEffects(this._themeConf.reconfigure(value === "light" ? [] : value === "dark" ? oneDark : value));
  }
  /** Sets editor's placeholder. */
  setPlaceholder(value) {
    this._dispatchEffects(this._placeholderConf.reconfigure(value ? placeholder(value) : []));
  }
  /** Sets editor' indentWithTab. */
  setIndentWithTab(value) {
    this._dispatchEffects(this._indentWithTabConf.reconfigure(value ? keymap.of([indentWithTab]) : []));
  }
  /** Sets editor's indentUnit. */
  setIndentUnit(value) {
    this._dispatchEffects(this._indentUnitConf.reconfigure(value ? indentUnit.of(value) : []));
  }
  /** Sets editor's lineWrapping. */
  setLineWrapping(value) {
    this._dispatchEffects(this._lineWrappingConf.reconfigure(value ? EditorView.lineWrapping : []));
  }
  /** Sets editor's highlightWhitespace. */
  setHighlightWhitespace(value) {
    this._dispatchEffects(this._highlightWhitespaceConf.reconfigure(value ? highlightWhitespace() : []));
  }
  /** Sets editor's language dynamically. */
  setLanguage(lang) {
    if (!lang || lang == "plaintext") {
      this._dispatchEffects(this._languageConf.reconfigure([]));
      return;
    }
    if (this.languages.length === 0) {
      if (this.view) {
        console.error("No supported languages. Please set the `languages` prop at first.");
      }
      return;
    }
    const langDesc = this._findLanguage(lang);
    langDesc?.load().then((lang2) => {
      this._dispatchEffects(this._languageConf.reconfigure([lang2]));
    });
  }
  /** Find the language's extension by its name. Case insensitive. */
  _findLanguage(name) {
    for (const lang of this.languages) {
      for (const alias of [lang.name, ...lang.alias]) {
        if (name.toLowerCase() === alias.toLowerCase()) {
          return lang;
        }
      }
    }
    console.error("Language not found:", name);
    console.info("Supported language names:", this.languages.map((lang) => lang.name).join(", "));
    return null;
  }
  static {
    this.ɵfac = function CodeEditor_Factory(__ngFactoryType__) {
      return new (__ngFactoryType__ || _CodeEditor)(ɵɵdirectiveInject(ElementRef));
    };
  }
  static {
    this.ɵcmp = ɵɵdefineComponent({
      type: _CodeEditor,
      selectors: [["code-editor"]],
      hostAttrs: [1, "code-editor"],
      inputs: {
        root: "root",
        autoFocus: [2, "autoFocus", "autoFocus", booleanAttribute],
        value: "value",
        disabled: [2, "disabled", "disabled", booleanAttribute],
        readonly: [2, "readonly", "readonly", booleanAttribute],
        theme: "theme",
        placeholder: "placeholder",
        indentWithTab: [2, "indentWithTab", "indentWithTab", booleanAttribute],
        indentUnit: "indentUnit",
        lineWrapping: [2, "lineWrapping", "lineWrapping", booleanAttribute],
        highlightWhitespace: [2, "highlightWhitespace", "highlightWhitespace", booleanAttribute],
        languages: "languages",
        language: "language",
        setup: "setup",
        extensions: "extensions"
      },
      outputs: {
        change: "change",
        focus: "focus",
        blur: "blur"
      },
      features: [ɵɵProvidersFeature([{
        provide: NG_VALUE_ACCESSOR,
        useExisting: forwardRef(() => _CodeEditor),
        multi: true
      }]), ɵɵNgOnChangesFeature],
      decls: 0,
      vars: 0,
      template: function CodeEditor_Template(rf, ctx) {
      },
      styles: [".code-editor{display:block}.code-editor .cm-editor{height:100%}\n"],
      encapsulation: 2,
      changeDetection: 0
    });
  }
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(CodeEditor, [{
    type: Component,
    args: [{
      selector: "code-editor",
      standalone: true,
      template: ``,
      host: {
        class: "code-editor"
      },
      encapsulation: ViewEncapsulation.None,
      changeDetection: ChangeDetectionStrategy.OnPush,
      providers: [{
        provide: NG_VALUE_ACCESSOR,
        useExisting: forwardRef(() => CodeEditor),
        multi: true
      }],
      styles: [".code-editor{display:block}.code-editor .cm-editor{height:100%}\n"]
    }]
  }], () => [{
    type: ElementRef
  }], {
    root: [{
      type: Input
    }],
    autoFocus: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }],
    value: [{
      type: Input
    }],
    disabled: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }],
    readonly: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }],
    theme: [{
      type: Input
    }],
    placeholder: [{
      type: Input
    }],
    indentWithTab: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }],
    indentUnit: [{
      type: Input
    }],
    lineWrapping: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }],
    highlightWhitespace: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }],
    languages: [{
      type: Input
    }],
    language: [{
      type: Input
    }],
    setup: [{
      type: Input
    }],
    extensions: [{
      type: Input
    }],
    change: [{
      type: Output
    }],
    focus: [{
      type: Output
    }],
    blur: [{
      type: Output
    }]
  });
})();
var DiffEditor = class _DiffEditor {
  constructor(_elementRef) {
    this._elementRef = _elementRef;
    this.setup = "basic";
    this.originalValue = "";
    this.originalExtensions = [];
    this.modifiedValue = "";
    this.modifiedExtensions = [];
    this.highlightChanges = true;
    this.gutter = true;
    this.disabled = false;
    this.originalValueChange = new EventEmitter();
    this.originalFocus = new EventEmitter();
    this.originalBlur = new EventEmitter();
    this.modifiedValueChange = new EventEmitter();
    this.modifiedFocus = new EventEmitter();
    this.modifiedBlur = new EventEmitter();
    this._onChange = () => {
    };
    this._onTouched = () => {
    };
    this._updateListener = (editor) => {
      return EditorView.updateListener.of((vu) => {
        if (vu.docChanged && !vu.transactions.some((tr) => tr.annotation(External))) {
          const value = vu.state.doc.toString();
          if (editor == "a") {
            this._onChange({
              original: value,
              modified: this.modifiedValue
            });
            this.originalValue = value;
            this.originalValueChange.emit(value);
          } else if (editor == "b") {
            this._onChange({
              original: this.originalValue,
              modified: value
            });
            this.modifiedValue = value;
            this.modifiedValueChange.emit(value);
          }
        }
      });
    };
    this._editableConf = new Compartment();
  }
  ngOnChanges(changes) {
    if (changes["originalValue"]) {
      this.setValue("a", this.originalValue);
    }
    if (changes["modifiedValue"]) {
      this.setValue("b", this.modifiedValue);
    }
    if (changes["orientation"]) {
      this.mergeView?.reconfigure({
        orientation: this.orientation
      });
    }
    if (changes["revertControls"]) {
      this.mergeView?.reconfigure({
        revertControls: this.revertControls
      });
    }
    if (changes["renderRevertControl"]) {
      this.mergeView?.reconfigure({
        renderRevertControl: this.renderRevertControl
      });
    }
    if (changes["highlightChanges"]) {
      this.mergeView?.reconfigure({
        highlightChanges: this.highlightChanges
      });
    }
    if (changes["gutter"]) {
      this.mergeView?.reconfigure({
        gutter: this.gutter
      });
    }
    if (changes["collapseUnchanged"]) {
      this.mergeView?.reconfigure({
        collapseUnchanged: this.collapseUnchanged
      });
    }
    if (changes["diffConfig"]) {
      this.mergeView?.reconfigure({
        diffConfig: this.diffConfig
      });
    }
    if (changes["disabled"]) {
      this.setEditable("a", !this.disabled);
      this.setEditable("b", !this.disabled);
    }
  }
  ngOnInit() {
    this.mergeView = new MergeView({
      parent: this._elementRef.nativeElement,
      a: {
        doc: this.originalValue,
        extensions: [this._updateListener("a"), this._editableConf.of([]), this.setup === "basic" ? basicSetup : this.setup === "minimal" ? minimalSetup : [], ...this.originalExtensions]
      },
      b: {
        doc: this.modifiedValue,
        extensions: [this._updateListener("b"), this._editableConf.of([]), this.setup === "basic" ? basicSetup : this.setup === "minimal" ? minimalSetup : [], ...this.modifiedExtensions]
      },
      orientation: this.orientation,
      revertControls: this.revertControls,
      renderRevertControl: this.renderRevertControl,
      highlightChanges: this.highlightChanges,
      gutter: this.gutter,
      collapseUnchanged: this.collapseUnchanged,
      diffConfig: this.diffConfig
    });
    this.mergeView?.a.contentDOM.addEventListener("focus", () => {
      this._onTouched();
      this.originalFocus.emit();
    });
    this.mergeView?.a.contentDOM.addEventListener("blur", () => {
      this._onTouched();
      this.originalBlur.emit();
    });
    this.mergeView?.b.contentDOM.addEventListener("focus", () => {
      this._onTouched();
      this.modifiedFocus.emit();
    });
    this.mergeView?.b.contentDOM.addEventListener("blur", () => {
      this._onTouched();
      this.modifiedBlur.emit();
    });
    this.setEditable("a", !this.disabled);
    this.setEditable("b", !this.disabled);
  }
  ngOnDestroy() {
    this.mergeView?.destroy();
  }
  writeValue(value) {
    if (this.mergeView && value != null && typeof value === "object") {
      this.originalValue = value.original;
      this.modifiedValue = value.modified;
      this.setValue("a", value.original);
      this.setValue("b", value.modified);
    }
  }
  registerOnChange(fn) {
    this._onChange = fn;
  }
  registerOnTouched(fn) {
    this._onTouched = fn;
  }
  setDisabledState(isDisabled) {
    this.disabled = isDisabled;
    this.setEditable("a", !isDisabled);
    this.setEditable("b", !isDisabled);
  }
  /** Sets diff-editor's value. */
  setValue(editor, value) {
    this.mergeView?.[editor].dispatch({
      changes: {
        from: 0,
        to: this.mergeView[editor].state.doc.length,
        insert: value
      }
    });
  }
  /** Sets diff-editor's editable state. */
  setEditable(editor, value) {
    this.mergeView?.[editor].dispatch({
      effects: this._editableConf.reconfigure(EditorView.editable.of(value))
    });
  }
  static {
    this.ɵfac = function DiffEditor_Factory(__ngFactoryType__) {
      return new (__ngFactoryType__ || _DiffEditor)(ɵɵdirectiveInject(ElementRef));
    };
  }
  static {
    this.ɵcmp = ɵɵdefineComponent({
      type: _DiffEditor,
      selectors: [["diff-editor"]],
      hostAttrs: [1, "diff-editor"],
      inputs: {
        setup: "setup",
        originalValue: "originalValue",
        originalExtensions: "originalExtensions",
        modifiedValue: "modifiedValue",
        modifiedExtensions: "modifiedExtensions",
        orientation: "orientation",
        revertControls: "revertControls",
        renderRevertControl: "renderRevertControl",
        highlightChanges: [2, "highlightChanges", "highlightChanges", booleanAttribute],
        gutter: [2, "gutter", "gutter", booleanAttribute],
        disabled: [2, "disabled", "disabled", booleanAttribute],
        collapseUnchanged: "collapseUnchanged",
        diffConfig: "diffConfig"
      },
      outputs: {
        originalValueChange: "originalValueChange",
        originalFocus: "originalFocus",
        originalBlur: "originalBlur",
        modifiedValueChange: "modifiedValueChange",
        modifiedFocus: "modifiedFocus",
        modifiedBlur: "modifiedBlur"
      },
      features: [ɵɵProvidersFeature([{
        provide: NG_VALUE_ACCESSOR,
        useExisting: forwardRef(() => _DiffEditor),
        multi: true
      }]), ɵɵNgOnChangesFeature],
      decls: 0,
      vars: 0,
      template: function DiffEditor_Template(rf, ctx) {
      },
      styles: [".diff-editor{display:block}.diff-editor :is(.cm-mergeView,.cm-mergeViewEditors){height:100%}.diff-editor :is(.cm-mergeView .cm-editor,.cm-mergeView .cm-scroller){height:100%!important}\n"],
      encapsulation: 2,
      changeDetection: 0
    });
  }
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(DiffEditor, [{
    type: Component,
    args: [{
      selector: "diff-editor",
      standalone: true,
      template: ``,
      host: {
        class: "diff-editor"
      },
      encapsulation: ViewEncapsulation.None,
      changeDetection: ChangeDetectionStrategy.OnPush,
      providers: [{
        provide: NG_VALUE_ACCESSOR,
        useExisting: forwardRef(() => DiffEditor),
        multi: true
      }],
      styles: [".diff-editor{display:block}.diff-editor :is(.cm-mergeView,.cm-mergeViewEditors){height:100%}.diff-editor :is(.cm-mergeView .cm-editor,.cm-mergeView .cm-scroller){height:100%!important}\n"]
    }]
  }], () => [{
    type: ElementRef
  }], {
    setup: [{
      type: Input
    }],
    originalValue: [{
      type: Input
    }],
    originalExtensions: [{
      type: Input
    }],
    modifiedValue: [{
      type: Input
    }],
    modifiedExtensions: [{
      type: Input
    }],
    orientation: [{
      type: Input
    }],
    revertControls: [{
      type: Input
    }],
    renderRevertControl: [{
      type: Input
    }],
    highlightChanges: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }],
    gutter: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }],
    disabled: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }],
    collapseUnchanged: [{
      type: Input
    }],
    diffConfig: [{
      type: Input
    }],
    originalValueChange: [{
      type: Output
    }],
    originalFocus: [{
      type: Output
    }],
    originalBlur: [{
      type: Output
    }],
    modifiedValueChange: [{
      type: Output
    }],
    modifiedFocus: [{
      type: Output
    }],
    modifiedBlur: [{
      type: Output
    }]
  });
})();
var CodeEditorModule = class _CodeEditorModule {
  static {
    this.ɵfac = function CodeEditorModule_Factory(__ngFactoryType__) {
      return new (__ngFactoryType__ || _CodeEditorModule)();
    };
  }
  static {
    this.ɵmod = ɵɵdefineNgModule({
      type: _CodeEditorModule,
      imports: [CodeEditor, DiffEditor],
      exports: [CodeEditor, DiffEditor]
    });
  }
  static {
    this.ɵinj = ɵɵdefineInjector({});
  }
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(CodeEditorModule, [{
    type: NgModule,
    args: [{
      imports: [CodeEditor, DiffEditor],
      exports: [CodeEditor, DiffEditor]
    }]
  }], null, null);
})();
export {
  CodeEditor,
  CodeEditorModule,
  DiffEditor,
  External
};
//# sourceMappingURL=@acrodata_code-editor.js.map
