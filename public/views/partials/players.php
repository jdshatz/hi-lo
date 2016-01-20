<div class="active-player-indicator"></div>
<ul class="players">
	<?php for ($i = 1; $i < 3; $i++) { ?>
		<li class="player" id="player<?= $i; ?>">
			<div class="player__details">
				<div class="player__points">
					<span></span>
					<em></em>
				</div>
				<h3 class="name"></h3>
				<h4 class="role"></h4>
			</div>
		</li>
	<?php } ?>
</ul>