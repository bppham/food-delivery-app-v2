const Heading = ({ title, description, keywords }) => {
  return (
    <>
      {title && <title>{title}</title>}
      {description && <meta name="description" content={description} />}
      {keywords && <meta name="keywords" content={keywords} />}
      <link rel="icon" type="image/png" href="/assets/logo_app.jpg" />
    </>
  );
};

export default Heading;
