import * as React from "react";
import { ReactSurveyElement, SurveyQuestionElementBase } from "./reactquestionelement";
import { QuestionMatrixModel } from "../question_matrix";
import { MatrixRowModel } from "../question_matrix";
import { ReactQuestionFactory } from "./reactquestionfactory";

export class SurveyQuestionMatrix extends SurveyQuestionElementBase {
  constructor(props: any) {
    super(props);
    this.state = { rowsChanged: 0 };
  }
  protected get question(): QuestionMatrixModel {
    return this.questionBase as QuestionMatrixModel;
  }
  componentDidMount() {
    super.componentDidMount();
    if (this.question) {
      var self = this;
      this.question.visibleRowsChangedCallback = function () {
        self.setState({ rowsChanged: self.state.rowsChanged + 1 });
      };
    }
  }
  componentWillUnmount() {
    super.componentWillUnmount();
    if (this.question) {
      this.question.visibleRowsChangedCallback = null;
    }
  }

  protected renderElement(): JSX.Element {
    var cssClasses = this.question.cssClasses;
    var firstTH = this.question.hasRows ? <td /> : null;
    var headers = [];
    for (var i = 0; i < this.question.visibleColumns.length; i++) {
      var column = this.question.visibleColumns[i];
      var key = "column" + i;
      var columText = this.renderLocString(column.locText);
      headers.push(
        <th className={this.question.cssClasses.headerCell} key={key} id={this.question.getAriaMatrixHeaderId(i)}>
          {columText}
        </th>
      );
    }
    var rows = [];
    var visibleRows = this.question.visibleRows;
    for (var i = 0; i < visibleRows.length; i++) {
      var row = visibleRows[i];
      var key = "row" + i;
      rows.push(
        <SurveyQuestionMatrixRow
          key={key}
          question={this.question}
          cssClasses={cssClasses}
          isDisplayMode={this.isDisplayMode}
          row={row}
          isFirst={i == 0}
        />
      );
    }
    var header = !this.question.showHeader ? null : (
      <thead>
        <tr>
          {firstTH}
          {headers}
        </tr>
      </thead>
    );
    return (
      <div className={cssClasses.tableWrapper}>
        <fieldset>
          <legend aria-label={this.question.locTitle.renderedHtml} />
          <table className={cssClasses.root}>
            {header}
            <tbody>{rows}</tbody>
          </table>
        </fieldset>
      </div>
    );
  }
}

export class SurveyQuestionMatrixRow extends ReactSurveyElement {
  constructor(props: any) {
    super(props);
    this.handleOnChange = this.handleOnChange.bind(this);
  }
  private get question(): QuestionMatrixModel {
    return this.props.question;
  }
  private get row(): MatrixRowModel {
    return this.props.row;
  }
  handleOnChange(event: any) {
    this.row.value = event.target.value;
    this.setState({ value: this.row.value });
  }
  protected canRender(): boolean {
    return !!this.row;
  }
  protected renderElement(): JSX.Element {
    var firstTD = null;
    if (this.question.hasRows) {
      var rowText = this.renderLocString(this.row.locText);
      firstTD = <td className={this.question.cssClasses.cell}>{rowText}</td>;
    }
    var tds = this.generateTds();
    return (
      <tr className={this.row.rowClasses}>
        {firstTD}
        {tds}
      </tr>
    );
  }
  generateTds() {
    var tds = [];
    var row = this.row;

    for (var i = 0; i < this.question.visibleColumns.length; i++) {
      var td = null;
      var column = this.question.visibleColumns[i];
      var key = "value" + i;

      var isChecked = row.value == column.value;
      let itemClass = this.question.getItemClass(row, column);
      var inputId = this.question.inputId + "_" + row.name + "_" + i;
      if (this.question.hasCellText) {
        var getHandler = !this.question.isReadOnly
          ? (column: any) => () => this.cellClick(row, column)
          : null;
        td = (
          <td
            key={key}
            className={itemClass}
            onClick={getHandler ? getHandler(column) : null}
          >
            {this.renderLocString(
              this.question.getCellDisplayLocText(row.name, column)
            )}
          </td>
        );
      } else {
        td = (
          <td
            key={key}
            headers={this.question.getAriaMatrixHeaderId(i)}
            className={this.question.cssClasses.cell}
          >
            <label className={itemClass}>
              <input
                id={inputId}
                type="radio"
                className={this.cssClasses.itemValue}
                name={row.fullName}
                value={column.value}
                disabled={this.isDisplayMode}
                checked={isChecked}
                onChange={this.handleOnChange}
                aria-required={this.question.isRequired}
                aria-label={this.question.locTitle.renderedHtml}
              />
              <span className={this.question.cssClasses.materialDecorator}>
                <svg
                  className={this.question.cssClasses.itemDecorator}
                  viewBox="-12 -12 24 24"
                >
                  <circle r="6" cx="0" cy="0" />s
                </svg>
              </span>
              <span className="circle" />
              <span className="check" />
              <span style={{ display: "none" }}>
                {this.question.locTitle.renderedHtml}
              </span>
            </label>
          </td>
        );
      }
      tds.push(td);
    }

    return tds;
  }
  cellClick(row: any, column: any) {
    row.value = column.value;
  }
}

ReactQuestionFactory.Instance.registerQuestion("matrix", (props) => {
  return React.createElement(SurveyQuestionMatrix, props);
});
