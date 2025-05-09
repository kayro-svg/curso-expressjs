// const appointmentService = require('../services/appointmentService');

// exports.getUserAppointments = async (req, res) => {
//     try {
//         const userId = req.params.id;
//         const appointments = await appointmentService.getUserAppointments(userId)
//         res.status(200).json(appointments);
//     } catch (error) {
//         res.status(500).json({ error: 'Error fetching appointments' });
//     }
// };

const appointmentService = require('../services/appointmentService');

exports.getUserAppointments = async (req, res) => {
    try {
        const userId = req.params.id;
        const appointments = await appointmentService.getUserAppointments(userId);

        if (!appointments) {
            return res.status(404).json({ error: 'No appointments found' });
        }
        res.status(200).json(appointments);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener el historial de citas' });
    }
};