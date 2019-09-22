import * as React from "react";
import { FormEvent } from "react";
import * as csv from "csvtojson";
import Spending from "./Spending";

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
      monthlySpendings: {},
      monthlySums: {},
      months: [],
      hasHeadline: true,
      isCalculated: false
    };
  }

  handleSubmit(event: FormEvent) {
    csv
      .default({
        delimiter: this.state.delimiter,
        noheader: !this.state.hasHeadline
      })
      .fromString(this.state.csvInput)
      .then(spendingRows => {
        const spendings = spendingRows.map(spending => new Spending(spending));
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
      monthlyAvarage[category] = aggregated[category]
        ? aggregated[category] / months.length
        : 0;
    }

    this.setState({
      isCalculated: true,
      aggregated,
      monthlyAvarage,
      monthlySpendings,
      months,
      monthlySums
    });
  }

  render = () => {
    let sum: number = 0;

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
        {this.state.isCalculated && (
          <div className="result">
            <h3>Monatliche Ausgaben:</h3>
            <table>

              <thead>

                <tr>
                  <th className="label">Category / Month</th>
                  {this.state.months.map((month, index) => (
                    <th key={index}>{month}</th>
                  ))}
                  <th className="avarage">Avarage</th>
                </tr>

              </thead>

              <tbody>

                {Object.entries(this.state.monthlySpendings).map(
                  ([category, monthlySpendings]) => {
                    const avarage = this.state.monthlyAvarage[category];
                    sum += avarage;

                    return (
                      <tr key={category}>
                        <th className="label">
                          {Spending.categories[category].label}
                        </th>
                        {this.state.months.map(month => (
                          <td className="amount" key={`${category}-${month}`}>
                            {monthlySpendings[month]
                              ? Math.round(monthlySpendings[month] * 100) / 100
                              : 0}{" "}
                            €
                          </td>
                        ))}
                        <td className="amount avarage">
                          {Math.round(avarage * 100) / 100} €
                        </td>
                      </tr>
                    );
                  }
                )}

                <tr key="sum">

                  <td className="label">
                    <strong>Gesamt</strong>
                  </td>

                  {Object.values(this.state.monthlySums).map((sum, index) => (
                    <td className="amount sum" key={index}>
                      {Math.round(sum * 100) / 100} €
                    </td>
                  ))}

                  <td className="amount sum avarage">
                    <strong>{Math.round(sum * 100) / 100} €</strong>
                  </td>

                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  };
}
