import sequelizePackage from 'sequelize';

const { ValidationError, DatabaseError } = sequelizePackage;

export default function checkError(error) {
  if (error instanceof ValidationError) {
    console.error('This is a validation error!');
    console.error('The following is the first error message:');
    console.error(error.errors[0].message);
  } else if (error instanceof DatabaseError) {
    console.error('This is a database error!');
    console.error(error);
  } else {
    console.error(error);
  }
}
