const remove = (username) => {
	$.ajax({
			url: `${base_url}api/admin/user/delete/${username}`,
			type: 'DELETE',
			dataType: 'json'
		})
		.done(data => {
			if (data.success)
				location.reload();
			else
				alert('danger', data.error);
		})
		.fail((jqXHR, status) => {
			alert('danger', `删除用户失败. Error: [${jqXHR.status}] ${jqXHR.statusText}`);
		});
};
