Physics Engine

Rules of the game:

- Gravity applies to certain objects - hero, enemy
- Gravity may not apply to certain objects - bullets, certain objects that follow a predefined path

- Objects can only move on the "Earth". If Objects fall in gaps, they disappear / die.
- Good / Bad cannot fall through the earth
- Bullets can pass through everything without any change in velocity / direction

Collision:
    - If good collides with bad or bad collides with good, good disappears / dies
    - If good collides with good or bad collides with bad, nothing happens
    - If good bullet collides with bad, bad dies
    - If bad bullet collides with good, good dies
    - If good bullet collides with good or bad bullet collides with bad, nothing happens

- Good / Bad can fire good bullets / bad bullets respectively
- Bad guys can appear at random points on the Earth.
- Bad guys can move in a random fashion (even suicidal)
- For the first few seconds that good guy appears, he should be invincible

- The viewport follows the good guy, so as to maintain the good guy at the center of the viewport.  However the viewport will not move in the negative x direction.
- Good guys can move along the negative x-direction only as far as the viewport but not outside the viewport. Same applies for the positive x-direction
- If a bad guy is not in the viewport, he should not act. Acting should only begin once it has entered the viewport and stop once he has left the viewport.

- The good guys have a certain limited number of max lives

- The game ends, and must be restarted when the good guys expire their max number of lives

- User can use the keyboard to control the precise motion of the good guy
