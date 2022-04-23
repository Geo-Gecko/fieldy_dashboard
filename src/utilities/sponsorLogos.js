


const logos = [
  {
    id: 1,
    title: "ESA",
    img: require("../images/esa.png").default,
    link: "https://www.esa.int/"
  },
  {
    id: 2,
    title: "NASA",
    img: require("../images/nasa.jpg").default,
    link: "http://www.nasa.gov/"
  },
  {
    id: 3,
    title: "JPL",
    img: require("../images/jpl.png").default,
    link: "https://www.jpl.nasa.gov/"
  },
  {
    id: 4,
    title: "JAXA",
    img: require("../images/jaxa.png").default,
    link: "https://global.jaxa.jp/about/centers/eoc/index.html"
  },
  {
    id: 5,
    title: "NOOA",
    img: require("../images/nooa.png").default,
    link: "https://www.noaa.gov"
  }
];

const LogosComponent = () => {
  return (
    <div className="kat">
      {logos.map(({ id, title, img, link }) => (
        <li key={id}>
          <div className="img-container">
            <a href={link} target="blank"><img src={img} alt={title}></img></a>
          </div>
        </li>
      ))}
    </div>
  );
};

export default LogosComponent