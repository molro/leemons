async function addRole(body) {
  return leemons.api('users/roles/add', {
    method: 'POST',
    body,
  });
}

export default addRole;
