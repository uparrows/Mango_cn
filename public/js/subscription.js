const component = () => {
	return {
		available: undefined,
		subscriptions: [],

		init() {
			$.getJSON(`${base_url}api/admin/mangadex/expires`)
				.done((data) => {
					if (data.error) {
						alert('danger', '未能检查 MangaDex 集成状态. Error: ' + data.error);
						return;
					}
					this.available = Boolean(data.expires && data.expires > Math.floor(Date.now() / 1000));

					if (this.available) this.getSubscriptions();
				})
				.fail((jqXHR, status) => {
					alert('danger', `未能检查 MangaDex 集成状态. Error: [${jqXHR.status}] ${jqXHR.statusText}`);
				})
		},

		getSubscriptions() {
			$.getJSON(`${base_url}api/admin/mangadex/subscriptions`)
				.done(data => {
					if (data.error) {
						alert('danger', '获取订阅失败. Error: ' + data.error);
						return;
					}
					this.subscriptions = data.subscriptions;
				})
				.fail((jqXHR, status) => {
					alert('danger', `获取订阅失败. Error: [${jqXHR.status}] ${jqXHR.statusText}`);
				})
		},

		rm(event) {
			const id = event.currentTarget.parentNode.getAttribute('data-id');
			$.ajax({
					type: 'DELETE',
					url: `${base_url}api/admin/mangadex/subscriptions/${id}`,
					contentType: 'application/json'
				})
				.done(data => {
					if (data.error) {
						alert('danger', `删除订阅失败. Error: ${data.error}`);
					}
					this.getSubscriptions();
				})
				.fail((jqXHR, status) => {
					alert('danger', `删除订阅失败. Error: [${jqXHR.status}] ${jqXHR.statusText}`);
				});
		},

		check(event) {
			const id = event.currentTarget.parentNode.getAttribute('data-id');
			$.ajax({
					type: 'POST',
					url: `${base_url}api/admin/mangadex/subscriptions/check/${id}`,
					contentType: 'application/json'
				})
				.done(data => {
					if (data.error) {
						alert('danger', `检查订阅失败. Error: ${data.error}`);
						return;
					}
					alert('success', 'Mango 现在正在检查订阅是否有更新。 这可能需要一段时间，但您可以安全地离开该页面.');
				})
				.fail((jqXHR, status) => {
					alert('danger', `检查订阅失败. Error: [${jqXHR.status}] ${jqXHR.statusText}`);
				});
		},

		formatRange(min, max) {
			if (!isNaN(min) && isNaN(max)) return `≥ ${min}`;
			if (isNaN(min) && !isNaN(max)) return `≤ ${max}`;
			if (isNaN(min) && isNaN(max)) return 'All';

			if (min === max) return `= ${min}`;
			return `${min} - ${max}`;
		}
	};
};
