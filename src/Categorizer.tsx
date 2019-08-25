import * as React from "react";
import { FormEvent } from "react";
import * as csv from "csvtojson";
import Spending, { categories } from "./Spending";

interface State {
  csvInput: string;
  spendings: Spending[];
  delimiter: string;
  aggregated: {
    [key: string]: number;
  };
  monthlyAvarage: {
    [key: string]: number;
  };
  hasHeadline: boolean;
}

export default class Categorizer extends React.Component<{}, State> {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleDelimiterChange = this.handleDelimiterChange.bind(this);
    this.handleHeadlineChange = this.handleHeadlineChange.bind(this);
    this.state = {
      delimiter: ",",
      aggregated: {},
      csvInput: "",
      spendings: [],
      monthlyAvarage: {},
      hasHeadline: true
    };
  }

  handleSubmit(event: FormEvent) {
    csv
      .default({
        noheader: !this.state.hasHeadline
      })
      .fromString(this.state.csvInput)
      .then(rawSpendings => {
        const spendings = rawSpendings.map(spending => new Spending(spending));
        this.setState({ spendings });
        this.analayzeData();
      });
    event.preventDefault();
  }

  handleChange(event) {
    this.setState({ csvInput: event.target.value });
  }

  handleDelimiterChange(event) {
    this.setState({ delimiter: event.target.value });
  }

  handleHeadlineChange(event) {
    this.setState({ hasHeadline: event.target.checked });
  }

  analayzeData() {
    const aggregated = {};
    const monthlyAvarage = {};

    for (const spending of this.state.spendings) {
      if (spending.amount < 0) {
        const key = spending.category.key;
        const amount = spending.amount * -1;
        const categoryAmount = aggregated[key];
        aggregated[key] =
          categoryAmount !== undefined ? categoryAmount + amount : 0;
      }
    }

    const timeRange =
      this.state.spendings[0].bookedDate.getTime() -
      this.state.spendings[
        this.state.spendings.length - 1
      ].bookedDate.getTime();
    const dayRange = timeRange / 1000 / 60 / 60 / 24;
    const monthRange = dayRange / 30;

    for (const key of Object.keys(aggregated)) {
      monthlyAvarage[key] = aggregated[key] / monthRange;
    }

    this.setState({ aggregated, monthlyAvarage });
  }

  render = () => {
    const tableRows: JSX.Element[] = [];
    let sum: number = 0;
    for (const key of Object.keys(this.state.monthlyAvarage)) {
      const amount = this.state.monthlyAvarage[key];
      sum += amount;
      const tr = (
        <tr key={key}>
          <td className="label">
            <strong>{categories[key].label}</strong>
          </td>
          <td className="amount">{Math.round(amount * 100) / 100} €</td>
        </tr>
      );
      tableRows.push(tr);
    }
    tableRows.push(
      <tr key="sum">
        <td className="label">
          <strong>Gesamt</strong>
        </td>
        <td className="amount">
          <strong>{Math.round(sum * 100) / 100} €</strong>
        </td>
      </tr>
    );

    return (
      <div>
        <form onSubmit={this.handleSubmit}>
          <span>
            <label htmlFor="csvInput">
              <p>Hier den CSV-Inhalt der Ausgaben einfügen:</p>
            </label>
            <textarea
              onChange={this.handleChange}
              name="csvInput"
              id="csvInput"
              cols={100}
              rows={10}
            />
          </span>
          <span>
            <label htmlFor="headline">Enthält Kopfzeile</label>
            <input
              type="checkbox"
              name="headline"
              id="headline"
              checked={this.state.hasHeadline}
              onChange={this.handleHeadlineChange}
            />
          </span>
          <span>
            <label htmlFor="delimiter">Trennzeichen: </label>
            <input
              id="delimiter"
              value={this.state.delimiter}
              onChange={this.handleDelimiterChange}
            />
          </span>
          <span>
            <button type="submit">Analysieren</button>
          </span>
        </form>
        <div className="result">
          <h3>Durchschnittliche monatliche Ausgaben:</h3>
          <table>
            <tbody>{tableRows}</tbody>
          </table>
        </div>
      </div>
    );
  };
}
