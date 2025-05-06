import React, { useState } from 'react';
//import { Modal, Button, Form } from 'react-bootstrap';
import API from '../services/api';

const TranchesModal = ({ show, handleClose, tranche, refreshData }) => {
    const [formData, setFormData] = useState(tranche || {
        Date_Tran: '',
        Heure_Tran: '',
        Montant_Tran: 0,
        ModePaie_Tran: '',
        Num_Tran: '',
        Num_Fact: '',
        code_paiement: '',
        etat_paiement: false
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            if (formData.Num_Tran) {
                await API.put(`/tranche/${formData.Num_Tran}`, formData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            } else {
                await API.post('/tranche', formData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }
            refreshData();
            handleClose();
        } catch (error) {
            console.error('Error saving tranche:', error);
        }
    };

    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>{formData.Num_Tran ? 'Edit' : 'Add'} Tranche</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                        <Form.Label>Date</Form.Label>
                        <Form.Control
                            type="datetime-local"
                            name="Date_Tran"
                            value={formData.Date_Tran}
                            onChange={handleChange}
                        />
                    </Form.Group>
                    // ... Add other form fields similarly ...
                    <Button variant="primary" type="submit">
                        Save
                    </Button>
                </Form>
            </Modal.Body>
        </Modal>
    );
};

export default TranchesModal;