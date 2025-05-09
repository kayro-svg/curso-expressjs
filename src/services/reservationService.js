const { PrismaClient } = require('../../generated/prisma');
const prisma = new PrismaClient();

exports.createReservation = async (data) => {
    const conflict = await prisma.appointment.findFirst({
        where: {
            timeBlockId: data.timeBlockId,
            date: data.date
        }
    });

    if (conflict) {
        throw new Error('Time block already booked');
    }

    return prisma.appointment.create({
        data: data
    });
}

exports.getReservation = async (id) => {
    return prisma.appointment.findUnique({
        where: {
            id: parseInt(id, 10)
        }
    });
}

exports.updateReservation = async (id, data) => {
    const conflict = await prisma.appointment.findFirst({
        where: {
            timeBlockId: data.timeBlockId,
            date: data.date,
            id: {
                not: parseInt(id, 10)
            }
        }
    });

    if (conflict) {
        throw new Error('Time block already booked');
    }

    return prisma.appointment.update({
        where: {
            id: parseInt(id, 10)
        },
        data: data
    });
}

exports.deleteReservation = async (id) => {
    return prisma.appointment.delete({
        where: {
            id: parseInt(id, 10)
        }
    });
}
