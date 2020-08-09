import * as React from "react";
import { FormEvent } from "react";
import * as csv from "csvtojson";
import Spending from "./Spending";
import { Months } from "./Months";

interface State {
  csvInput: string;
  spendings: Spending[];
  delimiter: string;
  aggregated: {
    [key: string]: number;
  };
  monthlyAverage: {
    [key: string]: number;
  };
  monthlySpendings: {
    [key: string]: {
      [key: string]: number;
    };
  };
  monthlySums: {
    [key: string]: number;
  };
  isCalculated: boolean;
  months: string[];
  hasHeadline: boolean;
}

export default class Categorizer extends React.Component<{}, State> {
  parseMonth(date: string): React.ReactNode {
    const [year, month] = date.split("-");
    return `${Months[month]} / ${year}`;
  }

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
      monthlyAverage: {},
      monthlySpendings: {},
      monthlySums: {},
      months: [],
      hasHeadline: true,
      isCalculated: false,
    };
  }

  handleSubmit(event: FormEvent) {
    csv
      .default({
        delimiter: this.state.delimiter,
        noheader: !this.state.hasHeadline,
      })
      .fromString(this.state.csvInput)
      .then((spendingRows) => {
        const spendings = spendingRows.map(
          (spending) => new Spending(spending)
        );
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
    const monthlyAverage = {};
    const monthlySpendings = {};
    const months: string[] = [];
    const monthlySums = {};

    for (const spending of this.state.spendings) {
      if (spending.amount < 0) {
        const category = spending.category.key;
        const amount = spending.amount * -1;
        const month = `${spending.bookedDate.getFullYear()}-${spending.bookedDate.getMonth()}`;
        const categoryAmount = aggregated[category];
        const monthlySpendingCategory = monthlySpendings[category];

        if (!monthlySpendingCategory) {
          monthlySpendings[category] = {};
        }

        const monthlySpending = monthlySpendings[category][month];

        if (!months.includes(month)) {
          months.push(month);
        }

        monthlySums[month] = monthlySums[month]
          ? amount + monthlySums[month]
          : amount;

        aggregated[category] = categoryAmount
          ? categoryAmount + amount
          : amount;

        monthlySpendings[category][month] = monthlySpending
          ? monthlySpending + amount
          : amount;
      }
    }

    for (const category of Object.keys(aggregated)) {
      monthlyAverage[category] = aggregated[category]
        ? aggregated[category] / months.length
        : 0;
    }

    this.setState({
      isCalculated: true,
      aggregated,
      monthlyAverage,
      monthlySpendings,
      months,
      monthlySums,
    });
  }

  amountify = (amount: number) => {
    return Math.round(amount * 100) / 100;
  };

  render = () => {
    return (
      <div>
        <form
          onSubmit={this.handleSubmit}
          className="pure-form pure-form-aligned"
        >
          <fieldset>
            <div className="pure-control-group">
              <label htmlFor="csvInput">
                <p>Hier den CSV-Inhalt der Ausgaben einfügen:</p>
              </label>
              <textarea
                onChange={this.handleChange}
                name="csvInput"
                id="csvInput"
                cols={100}
                rows={10}
                required
              />
            </div>
            <div className="pure-control-group">
              <label htmlFor="headline" className="pure-checkbox">
                <input
                  type="checkbox"
                  name="headline"
                  id="headline"
                  checked={this.state.hasHeadline}
                  onChange={this.handleHeadlineChange}
                />{" "}
                Enthält Kopfzeile
              </label>
            </div>
            <div className="pure-control-group">
              <label htmlFor="delimiter">Trennzeichen: </label>
              <input
                id="delimiter"
                type="text"
                value={this.state.delimiter}
                onChange={this.handleDelimiterChange}
                required
              />
            </div>
            <div className="pure-control-group">
              <button type="submit" className="pure-button pure-button-primary">
                Analysieren
              </button>
            </div>
          </fieldset>
        </form>
        {}
      </div>
    );
  };
}
