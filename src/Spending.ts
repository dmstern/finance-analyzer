interface SpendingRaw {
  "Umsatz abgerechnet und nicht im Saldo enthalten": string;
  Wertstellung: string;
  Belegdatum: string;
  Beschreibung: string;
  "Betrag (EUR)": string;
}

interface Category {
  key: string,
  label: string;
  matchPattern: RegExp;
}

export const categories : {
  [key: string]: Category;
} = {
  grocery: {
    key: 'grocery',
    label: "Supermarkt",
    matchPattern: /Aldi|Lidl|Real|Rewe|Tegut/gi
  },
  furniture: {
    key: 'furniture',
    label: "Einrichtung",
    matchPattern: /Ikea/gi
  },
  eat: {
    key: 'eat',
    label: "Auswärts Essen",
    matchPattern: /Vapiano|BACKWERK|Starbucks|Fodoora|Deliveroo|gastronomie/gi
  },
  cash: {
    key: 'cash',
    label: "Bar-Abhebung",
    matchPattern: /Cash|Bankhaus|Transact|GUERSOYBERLIN|Sparkasse/gi
  },
  drugStore: {
    key: 'drugStore',
    label: "Drogerie",
    matchPattern: /Drogerie|Rossmann|Mueller/gi
  },
  elektronics: {
    key: 'elektronics',
    label: "Elektronik",
    matchPattern: /electro|press|galeria/gi
  },
  bus: {
    key: 'bus',
    label: "Nahverkehr",
    matchPattern: /LOGPAYFINAN35314369001|BVGBERLIN/gi
  },
  vape: {
    key: 'vape',
    label: "Dampfen",
    matchPattern: /FAN-TASTICBERLIN|AVORIA|Vapango/gi
  },
  train: {
    key: 'train',
    label: "Fernverkehr",
    matchPattern: /DB Bahn|flix/gi
  },
  fun: {
    key: 'fun',
    label: "Freizeit",
    matchPattern: /ENTERTAINMENT|BLOC/gi
  },
  shopping: {
    key: 'shopping',
    label: "Internetkäufe und Anschaffungen",
    matchPattern: /thalia|amz|amazon\.de|etsy|tchibo|primark|nanu nana/gi
  },
  shoes: {
    key: 'shoes',
    label: "Schuhe",
    matchPattern: /deichmann/gi
  },
  charity: {
    key: 'charity',
    label: "Spende",
    matchPattern: /LEETCHI|CHANGE\.ORG/gi
  },
  pharmacy: {
    key: 'pharmacy',
    label: "Apotheke",
    matchPattern: /apotheke/gi
  },
  bike: {
    key: 'bike',
    label: "Fahrad",
    matchPattern: /rad/gi
  },
  other: {
    key: 'other',
    label: "Sonstiges",
    matchPattern: /.*/gi
  }
}
;

export default class Spending {
  notInSaldo: boolean;
  bookedDate: Date;
  billDate: Date;
  description: string;
  amount: number;
  category: Category;

  constructor(rawJson: SpendingRaw) {
    const values = Object.values(rawJson);
    this.amount = parseFloat(values[4].replace(',', '.'));
    this.bookedDate = this.parseDate(values[1]);
    this.billDate = this.parseDate(values[2]);
    this.description = values[3];
    this.notInSaldo = values[0] === "Ja";
    this.category = this.catecorize();
  }

  private catecorize(): Category {
    for (const category of Object.values(categories)) {
      if (this.description.match(category.matchPattern)) {
        return category;
      }
    }
    return categories.other;
  }

  parseDate(input: string): Date {
    var parts = input.match(/(\d+)/gi);
    var year = parts ? parseInt(parts[2], 10) : 1900;
    var month = parts ? parseInt(parts[1], 10) - 1 : 1;
    var day = parts ? parseInt(parts[0], 10) : 1;
    return new Date(year, month, day);
  }
}
