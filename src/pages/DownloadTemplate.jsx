import { useLayoutEffect, useRef, useState } from "react";
import backIcon from "../assets/icons/back.svg";
import downloadIcon from "../assets/icons/download.svg";
import sampleImage from "../assets/images/ai_img_sample.jpg"; //hardcoded image sampple
import { DEMO_BOUQUET } from "../pages/demoBouquet";
import Icon from "../components/Icon";
import "./DownloadTemplate.css";


const SHEET_W = 627;
const SHEET_H = 811;

const peso = new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" });

const GROUPS = [
  { key: "flowers", label: "Flowers" },
  { key: "fillers", label: "Fillers" },
  { key: "wrapper", label: "Wrap" },
  { key: "addOns", label: "Add-ons" },
];

// wrapper is a single object (or null); the rest are arrays
const itemsOf = (bouquet, key) => {
  const value = bouquet?.[key];
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
};

const labelOf = (item) => (item.quantity ? `${item.name} (${item.quantity})` : item.name);

const totalOf = (bouquet) =>
  GROUPS.reduce(
    (sum, { key }) => sum + itemsOf(bouquet, key).reduce((s, i) => s + (i.price ?? 0), 0),
    0
  );

/**
 * details: { fullName, email, contact, address, notes } from DetailsForm.
 * onDownload: TODO, wire to an image export (see the note in the reply).
 */
export default function DownloadTemplate({
  imageSrc = sampleImage,
  bouquet = DEMO_BOUQUET,
  details = {},
  onBack,
  onDownload = () => {},
}) {
  const stageRef = useRef(null);
  const sheetRef = useRef(null);      // the node to export
  const [scale, setScale] = useState(0.5);


  useLayoutEffect(() => {
    const el = stageRef.current;
    const update = () =>
      setScale(Math.min(el.clientWidth / SHEET_W, el.clientHeight / SHEET_H));
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const contactLine = [details.email, details.contact].filter(Boolean).join("  |  ");

  return (
    <main className="dl-page">
      <header className="dl-top">
        {onBack && (
          <button type="button" className="dl-back" onClick={onBack}>
            <img src={backIcon} alt="" width="20" height="20" /> Back
          </button>
        )}
      </header>

      <div className="dl-stage" ref={stageRef}>
        <div className="dl-fit" style={{ width: SHEET_W * scale, height: SHEET_H * scale }}>
          <div
            className="sheet"
            ref={sheetRef}
            style={{ width: SHEET_W, height: SHEET_H, transform: `scale(${scale})` }}
          >
            <div className="sheet__main">
              <div className="sheet__photo">
                <img src={imageSrc} alt="Your finished bouquet design" />
              </div>

              <div className="sheet__details">
                <h2 className="sheet__heading">Bouquet Details</h2>

                {GROUPS.map(({ key, label }) => {
                  const items = itemsOf(bouquet, key);
                  return (
                    <section key={key} className="sheet__group">
                      <h3>{label}</h3>
                      {items.length ? (
                        items.map((item) => (
                          <div key={item.name} className="sheet__item">
                            <p className="sheet__row">
                              <span>{labelOf(item)}</span>
                              <span>{peso.format(item.price ?? 0)}</span>
                            </p>
                            {item.variants?.length > 0 && (
                              <ul>
                                {item.variants.map((v) => (
                                  <li key={v.label}>{v.label} ({v.quantity})</li>
                                ))}
                              </ul>
                            )}
                          </div>
                        ))
                      ) : (
                        <p className="sheet__none">None</p>
                      )}
                    </section>
                  );
                })}

                <section className="sheet__group">
                  <h3>Total Estimated Price</h3>
                  <p className="sheet__total">{peso.format(totalOf(bouquet))}</p>
                </section>
              </div>
            </div>

            <div className="sheet__customer">
              <h2 className="sheet__heading">Customer Details</h2>
              <p className="sheet__name">{details.fullName}</p>
              <p>{contactLine}</p>
              <p className="sheet__address">{details.address}</p>
            </div>

            <div className="sheet__notes">
              <h3>Additional Notes</h3>
              <p>{details.notes}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="dl-footer">
        <button type="button" className="btn dl-download" onClick={onDownload}>
          <Icon src={downloadIcon} /> Download Image
        </button>
      </div>
    </main>
  );
}