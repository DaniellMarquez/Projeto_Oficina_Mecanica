export default function Footer() {
  return (
    <footer className="mt-5">
      <div className="container-fluid text-white py-3 px-4 d-flex flex-column flex-md-row justify-content-between align-items-center bg-brand-blue">
        <div className="fw-semibold mb-2 mb-md-0">
          Contate-nos através de nossas redes oficiais!
        </div>
        <div className="d-flex gap-3 fs-5">
          <a className="text-white" href="#"><i className="fa-brands fa-facebook"></i></a>
          <a className="text-white" href="#"><i className="fa-brands fa-instagram"></i></a>
          <a className="text-white" href="#"><i className="fa-brands fa-whatsapp"></i></a>
          <a className="text-white" href="#"><i className="fa-solid fa-envelope me-2"></i></a>
        </div>
      </div>
      <div className="container-fluid text-white py-4 px-4 bg-brand-orange">
        <div className="row text-center text-md-start">
          <div className="col-md-4 mb-3 mb-md-0">
            <h5 className="fw-bold mb-3">Sobre nós</h5>
            <p className="small text-light">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio.
            </p>
          </div>
          <div className="col-md-4 mb-3 mb-md-0">
            <h5 className="fw-bold mb-3">Links úteis</h5>
            <p className="small text-light">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio.
            </p>
          </div>
          <div className="col-md-4">
            <h5 className="fw-bold mb-3">Contato</h5>
            <ul className="list-unstyled small d-flex flex-column gap-2">
              <li><i className="fa-solid fa-house me-2"></i> Localização: Rua dos Bobos, 0 - Lugar nenhum</li>
              <li><i className="fa-brands fa-whatsapp me-2"></i> Whatsapp: (11) 99999-9999</li>
              <li><i className="fa-solid fa-envelope me-2"></i> E-mail: contato@vibemechanics.com</li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
