import React, { useState } from 'react';

import { toast } from 'react-toastify';
import axiosInstance from '../actions/axiosInstance';
import { Button, Modal, Form } from 'react-bootstrap';


const ContactFormRequest = ({ showContactForm, hideContactForm }) => {
  const [validated, setValidated] = useState(false);
  const [optionalMessage, setOptionalMessage] = useState('');
  const [message, setMessage] = useState('');

  const submitRequest = e => {
    e.preventDefault();

    const form = e.currentTarget;
    if (form.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true);
    } else {
      axiosInstance({
        url: "/layers/contact/",
        method: "POST",
        data: {message: `${message} \n ${optionalMessage}`}
      })
        .then(response => {
          hideContactForm()
          toast("We'll get in touch with you shortly", {
            position: "top-center",
            autoClose: 3500,
            hideProgressBar: true,
            closeOnClick: true,
            pauseOnHover: true,
          })
        })
        .catch(error => {
          hideContactForm()
          toast("An error occurred on ourside :( Try again in an hour.", {
            position: "top-center",
            autoClose: 3500,
            hideProgressBar: true,
            closeOnClick: true,
            pauseOnHover: true,
          })
        })
    }
  };

  return (
    <div>
      <Modal show={showContactForm} onHide={() => hideContactForm()}>
        <style type="text/css">
          {`
          .modal {
            z-index: 19999;
          }
          `}
        </style>
        <Modal.Title className="text-center">
          Get in touch with us!
        </Modal.Title>
        <Form noValidate validated={validated} onSubmit={submitRequest}>
          <Modal.Body>
            <Form.Group controlId="formComment">
              <Form.Label>Comment</Form.Label>
              <Form.Control
                required
                type="comment"
                autoComplete="nopeeeee"
                placeholder="Comment Here :)"
                onChange={e => setMessage(e.target.value)}
              />
            </Form.Group>

            <Form.Group controlId="formBasicPassword">
              <Form.Label>Additional Thoughts</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                autoComplete="nopeeeee"
                onChange={e => setOptionalMessage(e.target.value)}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <style type="text/css">
              {`
              .btn-comment {
                background-color: #e15b26;
              }
              `}
            </style>
            <Button variant="comment" type="submit">
              Send
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>

  );
};

export default ContactFormRequest;
