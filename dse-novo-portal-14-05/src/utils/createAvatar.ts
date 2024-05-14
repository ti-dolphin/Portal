import { capitalize } from 'lodash';
import { isNamedExports } from 'typescript';

// ----------------------------------------------------------------------

const PRIMARY_NAME = ['A', 'N', 'H', 'L', 'Q', '9', '8'];
const INFO_NAME = ['F', 'G', 'T', 'I', 'J', '1', '2', '3'];
const SUCCESS_NAME = ['K', 'D', 'Y', 'B', 'O', '4', '5'];
const WARNING_NAME = ['P', 'E', 'R', 'S', 'C', 'U', '6', '7'];
const ERROR_NAME = ['V', 'W', 'X', 'M', 'Z'];

function getFirstsCharacter(name: string) {
  const fullName: any = name && name.split(' ');
  var initials;
  if(fullName.length > 1){
    initials = fullName.shift().charAt(0) + fullName.pop().charAt(0);
  }else{
    initials = fullName.shift().charAt(0);
  }
  return initials.toUpperCase();
  // return capitalize(name && name.charAt(0));
}

function getFirstCharacter(name: string) {
  return capitalize(name && name.charAt(0));
}

function getAvatarColor(name: string) {
  if (PRIMARY_NAME.includes(getFirstCharacter(name))) return 'primary';
  if (INFO_NAME.includes(getFirstCharacter(name))) return 'info';
  if (SUCCESS_NAME.includes(getFirstCharacter(name))) return 'success';
  if (WARNING_NAME.includes(getFirstCharacter(name))) return 'warning';
  if (ERROR_NAME.includes(getFirstCharacter(name))) return 'error';
  return 'default';
}

export default function createAvatar(name: string) {
  return {
    name: getFirstsCharacter(name),
    color: getAvatarColor(name)
  } as const;
}
